import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 시공사례: 카테고리(펜션/호텔/스파/관공서)별 파일 1개.
// 각 파일의 items[] 배열이 실제 시공사례 카드 목록 → CMS에서 항목 추가로 관리.
const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(), // 브라우저 탭 & SEO <title>
    seoDescription: z.string(), // meta description / og description
    keywords: z.string().optional(),
    ogImage: z.string().optional(),
    order: z.number().default(0), // 메뉴/목록 정렬용
    label: z.string(), // 상단 소제목 (예: "PORTFOLIO / LINE-UP 03")
    heading: z.string(), // 큰 제목
    intro: z.string(), // 소개 문단
    features: z
      .array(z.object({ title: z.string(), body: z.string() }))
      .default([]),
    items: z
      .array(
        z.object({
          label: z.string().default('CASE'),
          title: z.string(),
          image: z.string(), // 카드 대표 이미지 (/assets/images/cases/...)
          date: z.string().optional(),
          address: z.string().optional(),
          scale: z.string().optional(),
          note: z.string().optional(), // 주요특징
          gallery: z.array(z.string()).default([]), // 상세 갤러리 이미지들
        })
      )
      .default([]),
  }),
});

export const collections = { cases };
