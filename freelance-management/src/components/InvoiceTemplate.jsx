import React from "react";
import Logo from "../../public/logo.jpg"; // ✅ Make sure logo.jpg exists in /public

const InvoiceTemplate = ({ data }) => {
  if (!data) return null;
  const { invoice, project, client } = data;

  const formatCurrency = (val) => {
    const amount = parseFloat(val || 0);
    const currency = invoice.currency || 'INR';
    
    if (currency === 'USD') {
      return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
  };

  return (
    <div
      id="invoice-printable"
      style={{
        width: "794px",
        margin: "auto",
        padding: "40px",
        background: "#ffffff",
        fontFamily: "Poppins, Arial, sans-serif",
        color: "#222",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* ---------------- HEADER ---------------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "3px solid #007bff",
          paddingBottom: "15px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={Logo}
            alt="Techlead ANKAN"
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
          <div>
            <h2
              style={{
                margin: 0,
                color: "#007bff",
                fontSize: "22px",
                letterSpacing: "0.5px",
              }}
            >
              Techlead-ANKAN
            </h2>
            <div style={{ fontSize: "13px", color: "#555" }}>
              Professional Web & Tech Solutions
            </div>
            <div style={{ fontSize: "12px", color: "#777" }}>
              +91 8617790081 | mr.ankanmaity@gmail.com
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <h3 style={{ margin: 0, color: "#111" }}>INVOICE</h3>
          <div style={{ fontSize: "13px", color: "#555" }}>
            #{invoice.invoice_number}
          </div>
          <div style={{ fontSize: "13px", color: "#555" }}>
            Date: {new Date(invoice.invoice_date).toLocaleDateString("en-IN")}
          </div>
          {invoice.invoice_type && (
            <div style={{ 
              fontSize: "12px", 
              color: "#007bff", 
              fontWeight: "600",
              marginTop: "4px",
              backgroundColor: "#f0f8ff",
              padding: "2px 8px",
              borderRadius: "4px",
              display: "inline-block"
            }}>
              {invoice.invoice_type.replace('_', ' ').toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- BILL TO ---------------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "24px",
        }}
      >
        <div style={{ width: "48%" }}>
          <div style={{ fontWeight: 600, fontSize: "13px", color: "#007bff" }}>
            Bill To:
          </div>
          <div style={{ marginTop: "6px", lineHeight: "1.4" }}>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              {client.name}
            </div>
            {client.company && <div>{client.company}</div>}
            <div>{client.email}</div>
            <div>{client.phone}</div>
          </div>
        </div>

        <div style={{ width: "48%", textAlign: "right" }}>
          <div style={{ fontWeight: 600, fontSize: "13px", color: "#007bff" }}>
            Project Details:
          </div>
          <div style={{ marginTop: "6px", lineHeight: "1.4" }}>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              {project.title || "Untitled Project"}
            </div>
            <div>
              Due Date:{" "}
              {new Date(invoice.due_date).toLocaleDateString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "24px",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f5f8ff",
              color: "#333",
              borderBottom: "2px solid #007bff",
            }}
          >
            <th style={{ textAlign: "left", padding: "10px" }}>Description</th>
            <th style={{ textAlign: "right", padding: "10px" }}>Quantity</th>
            <th style={{ textAlign: "right", padding: "10px" }}>Rate</th>
            <th style={{ textAlign: "right", padding: "10px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.services && invoice.services.length > 0 ? (
            invoice.services.map((s, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: i % 2 === 0 ? "#fff" : "#f9f9f9",
                  borderBottom: "1px solid #eee",
                }}
              >
                <td style={{ padding: "10px" }}>{s.description || "Service"}</td>
                <td style={{ textAlign: "right" }}>{s.quantity || 1}</td>
                <td style={{ textAlign: "right" }}>
                  {s.rate ? formatCurrency(s.rate) : "-"}
                </td>
                <td style={{ textAlign: "right", fontWeight: 500 }}>
                  {formatCurrency((s.quantity || 1) * (s.rate || 0))}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ padding: "10px" }}>
                {invoice.description || "Web Development Services"}
              </td>
              <td style={{ textAlign: "right" }}>1</td>
              <td style={{ textAlign: "right" }}>-</td>
              <td style={{ textAlign: "right" }}>
                {formatCurrency(invoice.amount)}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ---------------- TOTAL ---------------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            width: "250px",
            backgroundColor: "#f5f8ff",
            borderRadius: "8px",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <div>Subtotal:</div>
            <div>{formatCurrency(invoice.amount)}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              marginTop: "6px",
            }}
          >
            <div>Tax:</div>
            <div>{formatCurrency(invoice.tax)}</div>
          </div>

          <hr style={{ margin: "8px 0", borderColor: "#ccc" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: "14px",
              color: "#007bff",
            }}
          >
            <div>Total:</div>
            <div>{formatCurrency(invoice.amount + (invoice.tax || 0))}</div>
          </div>
        </div>
      </div>

      {/* ---------------- NOTES & FOOTER ---------------- */}
      <div
        style={{
          marginTop: "36px",
          fontSize: "12px",
          lineHeight: "1.6",
          color: "#555",
        }}
      >
        <div>
          <strong>Notes:</strong>
          <p>{invoice.notes || "Thank you for your business!"}</p>
        </div>

        <div style={{ marginTop: "12px" }}>
          <strong>Terms:</strong>
          <p>Payment due within 15 days from invoice date.</p>
        </div>

        <hr style={{ margin: "20px 0" }} />

        <div style={{ textAlign: "center", fontSize: "11px", color: "#777" }}>
          <p>
            © {new Date().getFullYear()} Techlead-ANKAN | All Rights Reserved
          </p>
          <p>
            <a
              href="https://techlead-ankan.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              techlead-ankan.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
