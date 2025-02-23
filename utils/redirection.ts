import path from "path"

// Redirection because __dirname doesn't exist on typescript
function redirection(redirect: string): string {
  const filename = new URL(import.meta.url).pathname
  const dirname = path.dirname(decodeURIComponent(filename))
  const newPath = path.resolve(dirname, `../${redirect}`)
  return newPath.replace("C:\\", "")
}

export default redirection
