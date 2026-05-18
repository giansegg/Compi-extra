import { ParserDashboard } from '@/components/ParserDashboard'
import { PARSERS } from '@/lib/parsers'

export function generateStaticParams() {
  return Object.keys(PARSERS).map(key => ({ parser: key }))
}

export default function ParserPage({ params }: { params: { parser: string } }) {
  return <ParserDashboard parserKey={params.parser} />
}
