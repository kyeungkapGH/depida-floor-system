import {defineType, defineField} from 'sanity'

// 뉴스레터 원고 — 여기엔 '내용'만 둔다.
// 누구에게 보냈는지·수신동의·발송 이력은 Cloudflare D1 이 관리한다(개인정보 + 법적 원장이라
// 스튜디오에서 편집 가능하면 안 되기 때문). 그래서 여기엔 발송 상태 필드가 없다.
//
// 제목 앞의 "(광고)" 표기와 하단 수신거부 링크·발송자 정보는 발송 시 자동으로 붙는다.
// 원고에 직접 쓰지 말 것 — 중복되거나 형식이 틀어진다.
export const newsletter = defineType({
  name: 'newsletter',
  title: '뉴스레터 (발송용)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '메일 제목',
      type: 'string',
      description:
        '수신자 메일함에 보이는 제목. 맨 앞 "(광고)" 는 발송할 때 자동으로 붙으니 쓰지 마세요. 예: 9월 신규 시공사례 — 제주 A리조트',
      validation: (rule) => rule.required().max(60).warning('40자 안팎이 모바일에서 잘리지 않습니다'),
    }),
    defineField({
      name: 'preheader',
      title: '미리보기 문구',
      type: 'string',
      description: '메일함에서 제목 옆에 작게 보이는 한 줄 (선택). 비워두면 본문 첫 문장이 보입니다.',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'body',
      title: '본문',
      type: 'array',
      description: '문단·소제목·목록·이미지·링크를 자유롭게 구성하세요.',
      validation: (rule) => rule.required().min(1),
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
      name: 'memo',
      title: '내부 메모',
      type: 'text',
      rows: 2,
      description: '발송 목적·대상 등 내부용 기록 (메일에 나가지 않습니다).',
    }),
    defineField({
      name: 'createdAt',
      title: '작성일',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {title: '작성일 최신순', name: 'createdDesc', by: [{field: 'createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', memo: 'memo', createdAt: 'createdAt'},
    prepare({title, memo, createdAt}) {
      const d = createdAt ? new Date(createdAt).toLocaleDateString('ko-KR') : ''
      return {title: title || '(제목 없음)', subtitle: [d, memo].filter(Boolean).join(' · ')}
    },
  },
})
