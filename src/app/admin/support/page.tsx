import { useGetSupport } from '@/hooks/useSupport';
import React from 'react'

type Props = {}

function Page({ }: Props) {
    const { data: supportTicket } = useGetSupport();
    console.log(supportTicket);
  return (
    <div>page</div>
  )
}

export default Page