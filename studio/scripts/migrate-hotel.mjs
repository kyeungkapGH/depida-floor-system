/**
 * 호텔·리조트 시공사례 15건을 기존 HTML에서 Sanity로 이관하는 스크립트 (파일럿).
 *
 * 실행: studio/ 폴더에서
 *   node scripts/migrate-hotel.mjs
 *
 * - .env 의 SANITY_AUTH_TOKEN(쓰기 권한 필요), SANITY_STUDIO_PROJECT_ID 를 사용합니다.
 * - 문서 _id 를 고정(case.hotel.<파일명>)해서 createOrReplace 로 넣기 때문에
 *   여러 번 실행해도 중복이 생기지 않습니다(멱등).
 * - 이미지는 Sanity가 내용 해시로 중복 제거하므로 재업로드해도 자산이 늘지 않습니다.
 */
import {createClient} from '@sanity/client'
import {readFileSync} from 'node:fs'
import {resolve, dirname, basename, extname} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMG_DIR = resolve(__dirname, '../../assets/images/cases')

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_AUTH_TOKEN

if (!projectId) throw new Error('SANITY_STUDIO_PROJECT_ID 가 없습니다 (.env 확인)')
if (!token) throw new Error('SANITY_AUTH_TOKEN 이 없습니다 (.env 확인, 쓰기 권한 토큰 필요)')

const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

// 한국어 날짜("2015년 1월 20일") → ISO("2015-01-20")
function toISODate(kr) {
  const m = kr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
  if (!m) return undefined
  const [, y, mo, d] = m
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// 파일명 → slug ("11-blue_nine.jpg" → "blue-nine")
function fileToSlug(file) {
  return basename(file, extname(file))
    .replace(/^\d+-/, '')
    .replace(/_/g, '-')
    .toLowerCase()
}

// 기존 cases-hotel.html 에서 그대로 옮겨온 15건
const HOTEL_CASES = [
  {title: '블루나인 리조트', label: 'RESORT', file: '11-blue_nine.jpg', date: '2015년 1월 20일', location: '충청남도 태안군', scale: '총 24개 동 전체 시공'},
  {title: '클럽인너호텔앤리조트', label: 'RESORT', file: '16-club_inner.jpeg', date: '2015년 8월 17일', location: '경기도 가평군 가평읍 금대리', scale: '총 24개 동 전체 시공'},
  {title: '에스앤골프리조트', label: 'RESORT', file: '24-SN_clubhouse_spas.jpg', date: '2017년 8월 2일', location: '충청남도 보령시 남포면', scale: '총 24개 동 전체 시공'},
  {title: '베드스테이션호텔', label: 'HOTEL', file: '33-bed_station.jpeg', date: '2018년 10월 14일', location: '인천광역시 미추홀구', scale: '총 24개 동 전체 시공'},
  {title: '헤르츠호텔', label: 'HOTEL', file: '36-hertz.jpeg', date: '2018년 5월 28일', location: '인천광역시 남구 주안동', scale: '총 24개 동 전체 시공'},
  {title: '호텔주노', label: 'HOTEL', file: '39-juno.jpg', date: '2019년 4월 10일', location: '경기도 용인시 처인구', scale: '총 24개 동 전체 시공'},
  {title: '인앤아웃호텔', label: 'HOTEL', file: '38-in_and_out.jpg', date: '2019년 5월 15일', location: '경기도 용인시 처인구', scale: '총 24개 동 전체 시공'},
  {title: '디자인 호텔 XYM', label: 'HOTEL', file: '40-XYM.jpg', date: '2019년 6월 12일', location: '충청남도 예산', scale: '총 24개 동 전체 시공'},
  {title: '인천 ST179 호텔', label: 'HOTEL', file: '41-ST179.jpg', date: '2019년 7월 22일', location: '인천광역시 연수구 주안동', scale: '총 24개 동 전체 시공'},
  {title: '호텔 주노', label: 'HOTEL', file: '44-juno.jpg', date: '2019년 11월 12일', location: '강원도 강릉시', scale: '총 24개 동 전체 시공'},
  {title: '속초 비즈니스호텔 카멜', label: 'HOTEL', file: '63-camel.png', date: '2019년 11월 12일', location: '인천광역시 연수구 주안동', scale: '총 24개 동 전체 시공'},
  {title: '호텔헤르츠', label: 'HOTEL', file: '74-hertz.jpg', date: '2022년 7월 24일', location: '서울특별시 관악구 신림동', scale: '총 24개 동 전체 시공'},
  {title: '하운드호텔 인천검단신도시', label: 'HOTEL', file: '75-hound.jpg', date: '2022년 10월 5일', location: '인천광역시 서구 검단신도시', scale: '총 24개 동 전체 시공'},
  {title: '그라미호텔', label: 'HOTEL', file: '80-grami.jpg', date: '2024년 4월 23일', location: '경상북도 포항시 남구 구룡포읍', scale: '총 24개 동 전체 시공'},
  {title: '잭니클라우스골프클럽코리아', label: 'RESORT', file: '90-jack_nicklaus.png', date: '2025년 3월 19일', location: '인천광역시 연수구 아카데미로 209', scale: '총 24개 동 전체 시공'},
]

async function run() {
  console.log(`프로젝트 ${projectId} / ${dataset} 에 호텔 사례 ${HOTEL_CASES.length}건 이관 시작...\n`)
  let i = 0
  const seenSlugs = new Map() // slug 충돌 시 -2, -3 … 로 유일화 (배열 순서 고정이라 재실행해도 동일)
  for (const c of HOTEL_CASES) {
    const idx = i++
    const baseSlug = fileToSlug(c.file)
    const dup = (seenSlugs.get(baseSlug) || 0) + 1
    seenSlugs.set(baseSlug, dup)
    const slug = dup === 1 ? baseSlug : `${baseSlug}-${dup}`
    const _id = `case.hotel.${slug}`
    const imgPath = resolve(IMG_DIR, c.file)

    process.stdout.write(`[${idx + 1}/${HOTEL_CASES.length}] ${c.title} ... `)

    // 1) 이미지 업로드 (동일 내용은 Sanity가 자동 중복제거)
    const asset = await client.assets.upload('image', readFileSync(imgPath), {filename: c.file})
    const imageRef = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}

    // 2) 문서 생성/교체
    await client.createOrReplace({
      _id,
      _type: 'case',
      title: c.title,
      category: 'hotel',
      label: c.label,
      date: toISODate(c.date),
      location: c.location,
      scale: c.scale,
      features: [],
      thumbnail: {...imageRef, options: {hotspot: true}},
      gallery: [{...imageRef, _key: `${slug}-0`}],
      slug: {_type: 'slug', current: slug},
    })

    console.log('완료')
  }
  console.log(`\n✅ 총 ${HOTEL_CASES.length}건 이관 완료.`)
}

run().catch((err) => {
  console.error('\n❌ 이관 실패:', err.message)
  process.exit(1)
})
