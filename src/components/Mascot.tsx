export function Mascot({
  small = false,
  celebrate = false,
}: {
  small?: boolean;
  celebrate?: boolean;
}) {
  return (
    <div
      className={`mascot ${small ? "mascot-small" : ""} ${celebrate ? "mascot-celebrate" : ""}`}
      role="img"
      aria-label="Mimo, ta petite mascotte de révision"
    >
      <div className="mimo-shadow" />
      <div className="mimo-antenna">
        <span />
      </div>
      <div className="mimo-arm left" />
      <div className="mimo-arm right" />
      <div className="mimo-body">
        <div className="mimo-shine" />
        <div className="mimo-face">
          <i />
          <i />
          <span />
        </div>
        <div className="mimo-cheek left" />
        <div className="mimo-cheek right" />
        <div className="mimo-badge">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="mimo-foot left" />
      <div className="mimo-foot right" />
    </div>
  );
}
