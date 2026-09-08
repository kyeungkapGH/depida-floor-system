import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'DEPIDA',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id('root')
          .title('콘텐츠')
          .items([
            S.listItem()
              .id('cases')
              .title('시공사례')
              .child(
                S.documentTypeList('case')
                  .title('시공사례')
                  // 목록 기본 정렬: 시공일자 최신순(가장 최근 건이 위)
                  .defaultOrdering([{field: 'date', direction: 'desc'}]),
              ),
            S.listItem()
              .id('posts')
              .title('뉴스룸')
              .child(
                S.documentTypeList('post')
                  .title('뉴스룸')
                  // 목록 기본 정렬: 발행일 최신순
                  .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
              ),
            S.divider(),
            // 메일로 나가는 원고. 발송 자체는 depida.com/admin/newsletter 에서 한다
            // (누구에게 보냈는지는 Cloudflare D1 이 관리 — 스튜디오에서 못 고치게)
            S.listItem()
              .id('newsletters')
              .title('뉴스레터 (발송용)')
              .child(
                S.documentTypeList('newsletter')
                  .title('뉴스레터 (발송용)')
                  .defaultOrdering([{field: 'createdAt', direction: 'desc'}]),
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
