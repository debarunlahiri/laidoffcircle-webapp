// Runs before first paint so the saved (or system) theme applies with no flash.
const script = `(function(){try{var t=localStorage.getItem("laidoffcircle:theme");if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
