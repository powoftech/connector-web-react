import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div>
      <div>
        <div>
          <div className="flex flex-col">
            <div className="flex min-h-screen flex-col">
              <div className="mx-auto flex min-h-screen w-full max-w-full grow flex-col px-[64px] md:max-w-[620px] md:px-[calc(24px+64px)]">
                <div className="mx-auto grid max-w-[360px] grow items-center justify-items-center">
                  <div className="">
                    <span className="text-system-16-font-size block max-w-full min-w-0 items-center overflow-visible text-center leading-[calc(1.3125*1em)] font-bold whitespace-pre-line">
                      Sorry, this page isn't available
                    </span>

                    <span className="text-barcelona-secondary-text mt-[12px] block max-w-full min-w-0 items-center overflow-visible text-center leading-[calc(1.4*1em)] font-normal text-balance whitespace-pre-line">
                      The link you followed may be broken, or the page may have
                      been removed.
                    </span>

                    <div className="mt-[16px] flex w-full justify-center">
                      <Link
                        to={'/'}
                        className="border-barcelona-primary-button-background bg-barcelona-primary-button-background text-barcelona-primary-button-text relative inline-flex h-[34px] min-h-0 max-w-full min-w-0 shrink-0 basis-auto cursor-pointer touch-manipulation flex-row items-center justify-center rounded-[10px] border px-4 py-0 font-semibold transition-transform duration-200 ease-in-out select-none active:scale-90"
                      >
                        <div>Back</div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
