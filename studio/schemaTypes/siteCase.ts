import {defineType, defineField} from 'sanity'

// 시공사례 — 비개발자가 폼으로 추가/수정하는 핵심 콘텐츠
export const siteCase = defineType({
  name: 'case',
  title: '시공사례',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      description: '예: 블루나인 리조트',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: '분류',
      type: 'string',
      options: {
        list: [
          {title: '호텔·리조트', value: 'hotel'},
          {title: '풀빌라·펜션', value: 'pension'},
          {title: '관공서·오피스·상업', value: 'public'},
          {title: '찜질방·사우나·스파', value: 'spa'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: '영문 라벨',
      type: 'string',
      description: '카드 상단 소문구. 예: RESORT, SPA (선택)',
    }),
    defineField({
      name: 'date',
      title: '시공일자',
      type: 'date',
      options: {dateFormat: 'YYYY년 MM월 DD일'},
    }),
    defineField({
      name: 'location',
      title: '주소',
      type: 'string',
      description: '예: 충청남도 태안군',
    }),
    defineField({
      name: 'siteUrl',
      title: '업체 홈페이지(사진 출처)',
      type: 'url',
      description: '시공한 업체(호텔·리조트·펜션 등)의 홈페이지. 카드/갤러리에 출처 링크로 표시됨 (선택)',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'geo',
      title: '좌표(지도 마커용)',
      type: 'geopoint',
      description:
        '전국 시공 지도에 마커로 표시할 위치. 비워두면 나중에 주소 텍스트로부터 일괄 지오코딩 가능 (선택)',
    }),
    defineField({
      name: 'scale',
      title: '시공규모',
      type: 'string',
      description: '예: 총 24개 동 전체 시공',
    }),
    defineField({
      name: 'features',
      title: '주요특징',
      type: 'array',
      of: [{type: 'string'}],
      description: '한 줄에 하나씩 입력',
    }),
    defineField({
      name: 'thumbnail',
      title: '대표 이미지',
      type: 'image',
      description: '목록 카드에 보이는 썸네일 (사진 없이 지도에만 표시할 현장은 비워도 됩니다)',
      options: {hotspot: true},
    }),
    defineField({
      name: 'gallery',
      title: '갤러리',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      description: '사례 상세에서 보여줄 사진들',
    }),
    defineField({
      name: 'slug',
      title: 'URL 주소(slug)',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
    }),
  ],
  orderings: [
    {
      title: '시공일자 최신순',
      name: 'dateDesc',
      by: [{field: 'date', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', category: 'category', media: 'thumbnail'},
    prepare({title, category, media}) {
      const labels: Record<string, string> = {
        hotel: '호텔·리조트',
        pension: '풀빌라·펜션',
        public: '관공서·오피스·상업',
        spa: '찜질방·사우나·스파',
      }
      return {title, subtitle: category ? labels[category] : '분류 미지정', media}
    },
  },
})
