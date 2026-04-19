const navLinks = [
  { label: "For Professionals", href: "/#professions" },
  { label: "About", href: "/about" },
];

const Navbar = () => {
  const pathname = window.location.pathname;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/#professions") {
      e.preventDefault();
      const el = document.getElementById("professions");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    } else if (href !== "#") {
      e.preventDefault();
      window.location.href = href;
    }
  };

  const isActive = (href: string) => {
    if (href === "/about") return pathname === "/about";
    if (href === "/#professions") return false;
    return false;
  };

  return (
    <nav
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #DDD9D3",
        height: 60,
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
        }}
      >
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#1C1917",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Defensible Zone™
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 14,
                color: isActive(link.href) ? "#2C5F5F" : "#6B6560",
                fontWeight: isActive(link.href) ? 700 : 400,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/#professions"
            onClick={(e) => handleClick(e, "/#professions")}
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "#FFFFFF",
              background: "#2C5F5F",
              borderRadius: 8,
              padding: "9px 20px",
              textDecoration: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Assess Your Career →
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
