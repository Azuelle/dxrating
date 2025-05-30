import cors from '@koa/cors'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import KoaSSE from 'koa-event-stream'
import Router from 'koa-router'
import { z } from 'zod'
import {
  v0Handler as fetchNetRecordsV0Handler,
  v1Handler as fetchNetRecordsV1Handler,
} from './functions/fetch-net-records'
import { handler as oneshotRendererHandler } from './functions/oneshot-renderer'
import type { AuthParams } from './lib/client'

const app = new Koa()
const router = new Router()

const authParamsSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(1),
  region: z.enum(['jp', 'intl']),
})

type AuthParamsWithRegion = z.infer<typeof authParamsSchema>

router.use(async (ctx, next) => {
  try {
    return await next()
  } catch (err) {
    console.error(err)
    ctx.status = 500
    ctx.body = {
      error: err instanceof Error ? err.message : 'internal server error',
    }
  }
})

router.get('/', async (ctx) => {
  ctx.body = {
    message: 'みるく is up and running! 🥛',
    _self: 'https://github.com/gekichumai/dxrating/tree/main/packages/self-hosted-functions',
  }
})

const verifyParams: Koa.Middleware = async (ctx, next) => {
  try {
    // Create a partial schema for the request body
    const requestBodySchema = z.object({
      id: z.string().optional(),
      password: z.string().optional(),
      region: z.string().optional(),
    })

    const body = requestBodySchema.parse(ctx.request.body)
    const region = ctx.params.region ?? body.region

    const result = authParamsSchema.parse({
      id: body.id,
      password: body.password,
      region,
    })

    ctx.state.authParams = {
      id: result.id,
      password: result.password,
    } as AuthParams
    ctx.state.region = result.region
    return next()
  } catch (err) {
    if (err instanceof z.ZodError) {
      ctx.status = 400
      ctx.body = {
        error: 'Invalid parameters',
        details: err.errors,
      }
      return
    }
    throw err
  }
}

router.post('/functions/fetch-net-records/v0', verifyParams, fetchNetRecordsV0Handler)
router.post('/functions/fetch-net-records/v1/:region', KoaSSE(), verifyParams, fetchNetRecordsV1Handler)

router.post('/functions/render-oneshot/v0', oneshotRendererHandler)
if (process.env.DEV === 'true') {
  router.get('/functions/render-oneshot/v0/demo', oneshotRendererHandler)
}

app.use(cors())
app.use(bodyParser({ enableTypes: ['json'] }))
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(process.env.PORT ?? 3000)
