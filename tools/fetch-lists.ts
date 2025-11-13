// Tool to fetch and convert EasyList filters to declarativeNetRequest rules
import { writeFileSync } from 'fs'
import { join } from 'path'

interface DeclarativeRule {
  id: number
  priority: number
  action: { type: 'block' }
  condition: {
    urlFilter?: string
    resourceTypes?: string[]
  }
}

// Common ad domains from EasyList
const commonAdDomains = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'adnxs.com',
  'advertising.com',
  'ads.yahoo.com',
  'amazon-adsystem.com',
  'pubmatic.com',
  'criteo.com',
  'taboola.com',
  'outbrain.com',
  'rubiconproject.com',
  'openx.net',
  'adsrvr.org',
  'adservice.google.com',
]

// Aggressive blocking domains
const aggressiveDomains = [
  'facebook.com/*/ads/*',
  'twitter.com/*/promoted*',
  'youtube.com/api/stats/ads*',
  'scorecardresearch.com',
  'quantserve.com',
  'moatads.com',
  '2mdn.net',
  'adform.net',
  'casalemedia.com',
  'serving-sys.com',
]

const resourceTypes = ['script', 'image', 'sub_frame', 'xmlhttprequest']

function generateRules(domains: string[], startId: number): DeclarativeRule[] {
  return domains.map((domain, index) => ({
    id: startId + index,
    priority: 1,
    action: { type: 'block' as const },
    condition: {
      urlFilter: `*${domain}*`,
      resourceTypes,
    },
  }))
}

async function main() {
  console.log('🎃 AdBusters Filter List Generator')
  console.log('==================================\n')

  // Generate base rules
  const baseRules = generateRules(commonAdDomains, 1)
  const baseRulesPath = join(process.cwd(), 'src', 'rules', 'baseRules.json')
  writeFileSync(baseRulesPath, JSON.stringify(baseRules, null, 2))
  console.log(`✓ Generated ${baseRules.length} base rules`)
  console.log(`  Saved to: ${baseRulesPath}`)

  // Generate aggressive rules
  const aggressiveRules = generateRules(aggressiveDomains, 100)
  const aggressiveRulesPath = join(process.cwd(), 'src', 'rules', 'aggressiveRules.json')
  writeFileSync(aggressiveRulesPath, JSON.stringify(aggressiveRules, null, 2))
  console.log(`✓ Generated ${aggressiveRules.length} aggressive rules`)
  console.log(`  Saved to: ${aggressiveRulesPath}`)

  console.log('\n👻 Filter lists ready for ghost trapping!')
  console.log('Run "npm run build" to include them in the extension.')
}

main().catch((error) => {
  console.error('Error generating filter lists:', error)
  process.exit(1)
})
