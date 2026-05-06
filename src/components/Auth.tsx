function Auth() {
  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <div className="">
          <h2>Sign in to your tenant</h2>
          <p>Enter your credentials to continue.</p>

          <form action="">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" name="" id="email" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" name="" id="password" />
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Auth
