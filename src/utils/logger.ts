export const logger = (...args: any[]) => {
  args.forEach(arg => console.log({arg}))
}