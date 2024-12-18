#!/usr/bin/env node
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { build as builder } from 'electron-builder'
import * as vars from './vars.mjs'
import { execSync } from 'child_process'

const isTag = (process.env.GITHUB_REF || process.env.BUILD_SOURCEBRANCH || '').startsWith('refs/tags/')

process.env.ARCH = process.env.ARCH || process.arch

builder({
    dir: true,
    win: ['nsis', 'zip'],
    arm64: process.env.ARCH === 'arm64',
    config: {
        extraMetadata: {
            version: vars.version,
        },
        publish: process.env.KEYGEN_TOKEN ? [
            vars.keygenConfig,
            {
                provider: 'github',
                channel: `latest-${process.env.ARCH}`,
            },
        ] : undefined,
        win: {
            sign: async function (configuration) {
                if (configuration.path) {
                    execSync(
                        `smctl sign --keypair-alias=${process.env.SM_KEYPAIR_ALIAS} --input "${String(configuration.path)}"`
                    )
                }
            }
        },
    },

    publish: process.env.KEYGEN_TOKEN ? isTag ? 'always' : 'onTagOrDraft' : 'never',
}).catch(e => {
    console.error(e)
    process.exit(1)
})
