import {defineType, defineField} from 'sanity'

// NEWS · 인사이트 — 비개발자가 폼으로 작성하는 기술 콘텐츠/소식 글
export const sitePost = defineType({
  name: 'post',
  title: '뉴스룸',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      description: '예: 펜션·풀빌라 전기온돌 시공비용, 평당 얼마일까?',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: '분류',
      type: 'string',
      options: {
        list: [
          {title: '비용·운영', value: 'cost'},
          {title: '기술·방식', value: 'tech'},
          {title: '뉴스·소식', value: 'news'},
        ],
        layout: 'radio',
      },
      initialValue: 'tech',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: '요약',
      type: 'text',
      rows: 3,
      description: '목록 카드와 검색결과(구글·네이버)에 보이는 한두 문장. 100~160자 권장',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'coverImage',
      title: '대표 이미지',
      type: 'image',
      description: '목록 카드 썸네일 + 상세 상단에 보이는 이미지',
      options: {hotspot: true},
    }),
    defineField({
      name: 'body',
      title: '본문',
      type: 'array',
      description: '문단·소제목·목록·이미지·인용을 자유롭게 구성',
      of: [
        {
          type: 'block',
          styles: [
            {title: '본문', value: 'normal'},
            {title: '소제목 (H2)', value: 'h2'},
            {title: '작은 제목 (H3)', value: 'h3'},
            {title: '인용', value: 'blockquote'},
          ],
          lists: [
            {title: '글머리 기호', value: 'bullet'},
            {title: '번호 목록', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: '굵게', value: 'strong'},
              {title: '기울임', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: '링크',
                fields: [{name: 'href', type: 'url', title: 'URL'}],
              },
            ],
          },
        },
        {type: 'image', options: {hotspot: true}},
      ],
    }),
    defineField({
      name: 'tags',
      title: '태그',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: '세부 주제·관련글 연결용 (선택). 예: 풀빌라, 유지비, 결로',
    }),
    defineField({
      name: 'publishedAt',
      title: '발행일',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL 주소(slug)',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: '발행일 최신순',
      name: 'publishedDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', category: 'category', media: 'coverImage'},
    prepare({title, category, media}) {
      const labels: Record<string, string> = {
        cost: '비용·운영',
        tech: '기술·방식',
        news: '뉴스·소식',
      }
      return {title, subtitle: category ? labels[category] : '분류 미지정', media}
    },
  },
})
