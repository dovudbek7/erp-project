import { Button, FormControl, Input, InputLabel } from "@mui/material"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type FieldValues } from "react-hook-form"
import { useNavigate } from "react-router"
function Auth() {
  // type Auth = {
  //   email: string
  //   password: string
  // }

  const navigate = useNavigate()
  
  const schema = z.object({
    email: z.string(),
    password: z.string().min(6, {message: "Password must be at least 6 characters"}),
  })
  // const handleClick = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()
  //   console.log("Clicked")
  // }
  const onSubmit = (data: FieldValues) => {
    console.log("Data", data)
    navigate('/')

  }

  type FormData = z.infer<typeof schema>

  const { handleSubmit, register } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gray-200text-center">
        <div className="">
          <h2 className="text-3xl px-7 py-6">Sign in to your tenant</h2>

          <form
            action=""
            className="flex flex-col gap-7"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="form-group ">
              <FormControl className="w-full">
                <InputLabel htmlFor="my-input">Email</InputLabel>
                <Input
                  id="my-input"
                  aria-describedby="my-helper-text"
                  {...register("email")}
                />
              </FormControl>
            </div>
            <div className="form-group ">
              <FormControl className="w-full">
                <InputLabel htmlFor="my-input">Password</InputLabel>
                <Input
                  id="my-input"
                  aria-describedby="my-helper-text"
                  type="password"
                  {...register("password")}
                />
              </FormControl>
            </div>

            <Button type="submit" className="bg-blue-500" variant="contained">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Auth
