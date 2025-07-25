import Button from '@/components/ui/Button';
import Input from '@/components/ui/Inputs';
import React from 'react'

type Props = {}

function Security({}: Props) {
  return (
    <div className="border-1 rounded-md p-3 md:p-12 lg:flex-row flex gap-y-8 gap-x-14 flex-col ">
      <div>
        <p className="text-[#25282B] font-bold text-base"> Change Password</p>
        <p className="text-[#6D7175] font-normal text-base md:max-w-60">
          New password must be different from previously used passwords.
        </p>
      </div>
      <form className="lg:px-6 pb-12 w-full max-w-150">
        <Input
          name="Oldpwd"
          onChange={() => null}
          type="password"
          label="Enter Old Password"
          className="h-[43px]"
          placeholder="Input your password"
          value=""
        />
        <Input
          name="Newpwd"
          onChange={() => null}
          type="password"
          label="Enter New Password"
          className="h-[43px]"
          placeholder="Input your password"
          value=""
        />
        <Input
          name="confrimpwd"
          onChange={() => null}
          type="password"
          label="Confirm New Password"
          className="h-[43px]"
          placeholder="Input your password"
          value=""
        />

        <Button variant="primary" size="medium" className="w-full my-4 ">
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default Security