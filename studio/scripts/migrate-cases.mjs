/**
 * pension / spa / public 시공사례를 원본 HTML(cases/*.html)에서 파싱해 Sanity로 이관.
 *
 * 실행: studio/ 폴더에서
 *   node scripts/migrate-cases.mjs
 *
 * - 원본 .depida-card 블록을 파싱(라벨·제목·시공일자·주소·시공규모·이미지).
 * - _id = case.<category>.<slug> 고정 + createOrReplace 라 멱등(여러 번 실행해도 중복 없음).
 * - slug 충돌 시 -2, -3 … 로 유일화. 이미지는 Sanity가 내용 해시로 중복 제거.
 * - hotel 은 migrate-hotel.mjs 로 이미 이관됨(여기선 제외).
 */
import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'node:fs'
import {resolve, dirname, basename, extname} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..') // depida-floor-system
const IMG_DIR = resolve(ROOT, 'assets/images/cases')
const CASES_DIR = resolve(ROOT, 'cases')

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_AUTH_TOKEN
if (!projectId) throw new Error('SANITY_STUDIO_PROJECT_ID 가 없습니다 (.env 확인)')
if (!token) throw new Error('SANITY_AUTH_TOKEN 이 없습니다 (.env 확인, 쓰기 권한 토큰 필요)')

const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

function toISODate(kr) {
  const m = kr && kr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
  if (!m) return undefined
  const [, y, mo, d] = m
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function fileToSlug(file) {
  return basename(file, extname(file)).replace(/^\d+-/, '').replace(/_/g, '-').toLowerCase()
}
function decode(s) {
  return (s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

const CATEGORIES = [
  {category: 'pension', file: 'cases-pension.html'},
  {category: 'spa', file: 'cases-spa.html'},
  {category: 'public', file: 'cases-public.html'},
]

// 원본 .depida-card 블록 파싱
function parseCards(html) {
  const parts = html.split('class="depida-card"') // 뒤 따옴표 포함이라 -label 등과 안 겹침
  const cards = []
  for (let i = 1; i < parts.length; i++) {
    const c = parts[i]
    const img = c.match(/src="[^"]*\/cases\/([^"]+)"/)
    const title = c.match(/depida-card-title">([^<]*)</)
    if (!img || !title) continue
    const label = c.match(/depida-card-label">([^<]*)</)
    const date = c.match(/시공일자<\/span>\s*:\s*([^<]*)</)
    const loc = c.match(/주소<\/span>\s*:\s*([^<]*)</)
    const scale = c.match(/시공규모<\/span>\s*:\s*([^<]*)</)
    cards.push({
      file: img[1],
      title: decode(title[1]),
      label: label ? decode(label[1]) : undefined,
      date: date ? toISODate(date[1]) : undefined,
      location: loc ? decode(loc[1]) : undefined,
      scale: scale ? decode(scale[1]) : undefined,
    })
  }
  return cards
}

async function run() {
  let parsed = 0
  let uploaded = 0
  let skipped = 0
  for (const {category, file} of CATEGORIES) {
    const html = readFileSync(resolve(CASES_DIR, file), 'utf8')
    const cards = parseCards(html)
    console.log(`\n[${category}] ${file} — ${cards.length}건 파싱`)
    const seen = new Map()
    for (const c of cards) {
      parsed++
      const base = fileToSlug(c.file)
      const dup = (seen.get(base) || 0) + 1
      seen.set(base, dup)
      const slug = dup === 1 ? base : `${base}-${dup}`
      const _id = `case.${category}.${slug}`
      const imgPath = resolve(IMG_DIR, c.file)
      if (!existsSync(imgPath)) {
        console.log(`  ⚠️ 이미지 없음 → 건너뜀: ${c.title} (${c.file})`)
        skipped++
        continue
      }
      const asset = await client.assets.upload('image', readFileSync(imgPath), {filename: c.file})
      const imageRef = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
      await client.createOrReplace({
        _id,
        _type: 'case',
        title: c.title,
        category,
        label: c.label,
        date: c.date,
        location: c.location,
        scale: c.scale,
        features: [],
        thumbnail: {...imageRef, options: {hotspot: true}},
        gallery: [{...imageRef, _key: `${slug}-0`}],
        slug: {_type: 'slug', current: slug},
      })
      uploaded++
      process.stdout.write(`  [${uploaded}] ${c.title}\n`)
    }
  }
  console.log(`\n✅ 파싱 ${parsed} / 업로드 ${uploaded} / 건너뜀 ${skipped}`)
}

run().catch((err) => {
  console.error('\n❌ 이관 실패:', err.message)
  process.exit(1)
})
