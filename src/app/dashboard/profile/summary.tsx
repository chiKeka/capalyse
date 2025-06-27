import Input from '@/components/ui/Inputs'
import React from 'react'

type Props = {}

export default function Summary({}: Props) {
  return (
    <div>
      <div className='w-full grid grid-col-1 lg:w-[85%]'>
        <Input
          name="desc"
          onChange={() => null}
          type="text"
          label="Short pitch/description"
          className="h-[112px] "
          placeholder="Input short business description"
          value=""
        />
      </div>

      <div className="grid grid-cols-1 gap-2 lg:w-[80%] w-full lg:grid-cols-2">
        <Input
          name="desc"
          onChange={() => null}
          type="text"
          label="Mission Statement"
          className="h-[112px] w-full"
          placeholder="Enter Mission Statement"
          value=""
        />{" "}
        <Input
          name="desc"
          onChange={() => null}
          type="text"
          label="Vision Statement"
          className="h-[112px] w-full"
          placeholder="Enter Vision Statement"
          value=""
        />
      </div>
    </div>
  );
}