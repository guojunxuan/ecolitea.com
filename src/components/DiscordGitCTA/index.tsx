import { DiscordUsersPill } from '@components/DiscordUsersPill/index'
import { ArrowIcon } from '@root/icons/ArrowIcon/index'
import Link from 'next/link'
import React from 'react'

import classes from './index.module.scss'

const discordURL = 'https://discord.gg/FSn5QRdsbC'

export const DiscordGitCTA: React.FC<{ appearance?: 'default' | 'minimal' }> = ({ appearance }) => {
  return (
    <div className={classes.ctaWrap}>
      <Link aria-label="Chat on Discord" className={classes.cta} href={discordURL} target="_blank">
        <div className={classes.message}>
          Chat on Discord
          <ArrowIcon className={classes.arrow} />
        </div>
        <div className={classes.discordButton}>
          <DiscordUsersPill className={classes.ctaPill} />
        </div>
      </Link>
      {appearance === 'default' && (
        <div className={classes.enterpriseCTA}>
          <strong>Can&apos;t find what you&apos;re looking for?</strong>
          <br />
          <p className={classes.license}>
            Get dedicated engineering support{' '}
            <Link className={classes.button} href="/talk-to-us" prefetch={false}>
              directly from the Payload team
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  )
}
