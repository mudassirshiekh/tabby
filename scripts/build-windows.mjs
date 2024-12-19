#!/usr/bin/env node
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { build as builder } from 'electron-builder'
import * as vars from './vars.mjs'
import { execSync } from 'child_process'

const isTag = (process.env.GITHUB_REF || process.env.BUILD_SOURCEBRANCH || '').startsWith('refs/tags/')
const keypair = process.env.SM_KEYPAIR_ALIAS

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
            certificateSha1: process.env.SM_CODE_SIGNING_CERT_SHA1_HASH,
            publisherName: process.env.SM_PUBLISHER_NAME,
            signingHashAlgorithms: ['sha256'],
            sign: keypair ? async function (configuration) {
                if (configuration.path) {
                    execSync(
                        `smctl sign --keypair-alias=${keypair} --input "${String(configuration.path)}"`, {
                            stdio: 'inherit'
                        }
                    )
                }
            } : undefined,
        },
    },

    publish: process.env.KEYGEN_TOKEN ? isTag ? 'always' : 'onTagOrDraft' : 'never',
}).catch(e => {
    console.error(e)
    process.exit(1)
})
