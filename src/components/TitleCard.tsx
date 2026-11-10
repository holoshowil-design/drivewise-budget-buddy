/**
 * The opening title card, like the first frame of a 1961 short: "הקפטן וטורבו מציגים · דרייבר",
 * then an iris opens onto the app. It is in the first HTML and runs on CSS alone, so it
 * covers the moment the app loads instead of adding to it. Once per launch: the script
 * marks <html data-opened> on later loads in the same session, and also while a trip is
 * being measured (never anything extra on the way to the drive screen).
 */
const ONCE = `try{var d=document.documentElement,s=sessionStorage;if(s.getItem("driver-opened")||localStorage.getItem("driver-active-trip")){d.setAttribute("data-opened","1")}s.setItem("driver-opened","1")}catch(e){document.documentElement.setAttribute("data-opened","1")}`;

export function TitleCardScript() {
  return <script dangerouslySetInnerHTML={{ __html: ONCE }} />;
}

export function TitleCard() {
  return (
    <div className="title-card" aria-hidden="true">
      <span className="title-iris" />
      <div className="title-content">
        <div className="title-presents">הקפטן וטורבו מציגים</div>
        <div className="title-name">דרייבר</div>
        <div className="title-rule" />
      </div>
    </div>
  );
}
