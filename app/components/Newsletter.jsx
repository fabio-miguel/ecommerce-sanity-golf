const Newsletter = () => {
  return (
    <div className="col-span-12 flex flex-col gap-5 md:col-span-8 md:gap-7 lg:col-span-5 py-4">
      <h3 className="whitespace-pre-wrap max-w-prose font-bold text-xl">
        Join our newsletter
      </h3>
      <form action="#">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-2 xs:flex-row xs:gap-1">
            <div className=" flex gap-1 relative lg:w-full">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                className="bg-zinc-700 border transition border-transparent appearance-none p-3 px-6 focus:ring-transparent focus:border-spanishGray placeholder:text-spanishGray text-p4 rounded-full w-full"
                required
              />
              <button
                className="flex justify-center gap-2 items-center rounded-3xl uppercase text-button text-center py-3 px-6  xs:py-4 xs:px-8 hover:roll-activate focus:roll-activate disabled:text-opacity-50 group whitespace-nowrap bg-white text-black w-auto"
                type="submit"
                aria-label="Subscribe Newsletter"
              >
                <span className="block roll">Subscribe</span>
              </button>
            </div>
            <p className="text-p1 text-sm text-gray-400 text-web">
              By subscribing you agree to the ___ Privacy Policy and Terms of
              Serivce apply.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
export default Newsletter;
