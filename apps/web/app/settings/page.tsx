export default function SettingsPage() {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <p className="muted">
        标准设置分组：Account / Subscription & Usage / Notifications / Privacy / General / About（第一期先占位）。
      </p>

      <div className="row">
        <div className="pill">Delete account（必须）</div>
        <div className="pill">Restore purchase</div>
        <div className="pill">Analytics opt-out（可选加分）</div>
        <div className="pill">Language / Timezone</div>
      </div>
    </div>
  );
}

