// =======================================
// SCRIPT.JS FINAL (BACKWARD CHAINING APP)
// =======================================

// Path JSON informasi penyakit
const penyakitPath = "assets/penyakit-info.json";

// =============================
// Daftar Gejala (Tabel 2 Jurnal)
// =============================
const gejalaList = [
  { kode: "GS001", nama: "Penurunan kesadaran" },
  { kode: "GS002", nama: "Mendadak kejang" },
  { kode: "GS003", nama: "Pernapasan tidak teratur" },
  { kode: "GS004", nama: "Merasa gelisah" },
  { kode: "GS005", nama: "Menjadi lebih sensitif" },
  { kode: "GS006", nama: "Sakit kepala yang hebat" },
  { kode: "GS007", nama: "Gangguan penglihatan" },
  { kode: "GS008", nama: "Nyeri dada" },
  { kode: "GS009", nama: "Sulit menelan" },
  { kode: "GS010", nama: "Menjadi pelupa" },
  { kode: "GS011", nama: "Lemah lesu" },
  { kode: "GS012", nama: "Sulit berbicara" },
  { kode: "GS013", nama: "Sisi wajah lemah atau asimetris" },
  { kode: "GS014", nama: "Punggung linu-linu" },
  { kode: "GS015", nama: "Lumpuh di salah satu sisi tubuh" },
  { kode: "GS016", nama: "Kemampuan keseimbangan menghilang" }
];

// =============================
// RULES Backward Chaining
// =============================
const rules = [
  {
    penyakit: "Stroke Hemoragik (Berat)",
    kondisi: ["GS001", "GS002", "GS003", "GS004", "GS005"]
  },
  {
    penyakit: "Stroke Non-Hemoragik Tingkat 1",
    kondisi: ["GS005", "GS006", "GS007", "GS008"]
  },
  {
    penyakit: "Stroke Non-Hemoragik Tingkat 2",
    kondisi: ["GS007", "GS009", "GS010", "GS011"]
  },
  {
    penyakit: "Stroke Non-Hemoragik Tingkat 3",
    kondisi: ["GS012", "GS013", "GS014", "GS015", "GS016"]
  }
];

// =============================
// LOAD JSON PENYAKIT
// =============================
async function loadPenyakit() {
  try {
    const res = await fetch(penyakitPath);
    return await res.json();
  } catch (e) {
    console.error("Gagal memuat penyakit-info.json:", e);
    return null;
  }
}

// =============================
// INDEX.HTML — Mulai Diagnosa
// =============================
if (document.getElementById("start-btn")) {
  document.getElementById("start-btn").addEventListener("click", () => {
    const nama = document.getElementById("nama").value.trim();
    const umur = document.getElementById("umur").value.trim();
    const jk = document.getElementById("jk").value;

    if (!nama || !umur || !jk) {
      alert("Mohon isi Nama, Umur, dan Jenis Kelamin.");
      return;
    }

    sessionStorage.setItem("user_info", JSON.stringify({ nama, umur, jk }));
    window.location.href = "gejala.html";
  });
}

// tombol lihat informasi penyakit di index
if (document.getElementById("info-penyakit-btn")) {
  document.getElementById("info-penyakit-btn").addEventListener("click", () => {
    window.location.href = "informasi.html";
  });
}


// =============================
// GEJALA.HTML — Generate Checkbox
// =============================
if (document.getElementById("gejala-grid")) {
  const grid = document.getElementById("gejala-grid");

  const user = JSON.parse(sessionStorage.getItem("user_info") || "{}");
  if (user.nama) {
    document.getElementById(
      "user-summary"
    ).innerHTML = `Diagnosa untuk <b>${user.nama}</b>, ${user.umur} tahun, ${user.jk}`;
  }

  // Generate gejala checklist dengan checkbox visual revisi
  gejalaList.forEach((g) => {
    const id = `chk_${g.kode}`;
    const div = document.createElement("div");
    div.className = "gejala-item";

    div.innerHTML = `
      <label class="gejala-check">
        <input type="checkbox" id="${id}" class="real-checkbox">
        <span class="checkbox-visual"></span>
        <span class="gejala-label">${g.kode} — ${g.nama}</span>
      </label>
    `;

    grid.appendChild(div);
  });

  // tombol proses diagnosa
  document.getElementById("proses-btn").addEventListener("click", () => {
    const selected = [];
    gejalaList.forEach((g) => {
      const el = document.getElementById(`chk_${g.kode}`);
      if (el && el.checked) selected.push(g.kode);
    });

    sessionStorage.setItem("selected_gejala", JSON.stringify(selected));
    window.location.href = "hasil.html";
  });

  document
    .getElementById("to-home")
    .addEventListener("click", () => (window.location.href = "index.html"));

  // ===========================
  // MODAL INFORMASI PENYAKIT
  // ===========================
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");

  document
    .getElementById("info-penyakit-btn")
    .addEventListener("click", async () => {
      const p = await loadPenyakit();
      if (!p) {
        modalContent.innerHTML = "Gagal memuat data penyakit.";
        modal.style.display = "flex";
        return;
      }

      let html = "";
      for (const key in p) {
        if (!p[key].jenis) continue;

        html += `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0; color:var(--primary); font-weight:700">${key}</h4>
          <div class="small-muted">Jenis: ${p[key].jenis} — Skala: ${p[key].skala}</div>
          <div style="margin-top:6px;"><b>Keterangan:</b><br>${p[key].keterangan}</div>
          <div style="margin-top:6px;"><b>Penanganan:</b><br>${p[key].penanganan}</div>
        </div>
      `;
      }

      modalContent.innerHTML = html;
      modal.style.display = "flex";
    });

  document
    .getElementById("close-modal")
    .addEventListener("click", () => (modal.style.display = "none"));

  modal.addEventListener("click", (ev) => {
    if (ev.target === modal) modal.style.display = "none";
  });
}

// =============================
// HASIL.HTML — Logika Backward Chaining
// =============================
if (document.getElementById("hasil-list")) {
  const selected = JSON.parse(
    sessionStorage.getItem("selected_gejala") || "[]"
  );
  const user = JSON.parse(sessionStorage.getItem("user_info") || "{}");

  const hasilListEl = document.getElementById("hasil-list");
  const finalConclusionEl = document.getElementById("final-conclusion");
  const hasilUserEl = document.getElementById("hasil-user");

  hasilUserEl.innerHTML = `Nama: <b>${user.nama}</b> — ${user.umur} tahun — ${user.jk}`;

  const conclusions = [];
  const persentaseList = [];

  // per-rule backward chaining
  rules.forEach((rule) => {
    const cocok = rule.kondisi.filter((k) => selected.includes(k)).length;
    const total = rule.kondisi.length;
    const persen = Math.round((cocok / total) * 100);

    persentaseList.push({ penyakit: rule.penyakit, persen, cocok, total });

    if (cocok === total) {
      conclusions.push(rule.penyakit);
    }
  });

  // urutkan persentase terbesar
  persentaseList.sort((a, b) => b.persen - a.persen);

  // tampilkan list persentase
  persentaseList.forEach((h) => {
    const li = document.createElement("li");
    li.className = "hasil-item";
    li.innerHTML = `
      <div>
        <b>${h.penyakit}</b>
        <div class="small-muted">${h.cocok}/${h.total} gejala cocok</div>
      </div>
      <div class="persen">${h.persen}%</div>
    `;
    hasilListEl.appendChild(li);
  });

  // tampilkan kesimpulan backward chaining
  if (conclusions.length > 0) {
    finalConclusionEl.innerHTML = `
      <div style="padding:12px;background:#f0fff6;border-left:4px solid var(--success);border-radius:8px;">
        <b>Kesimpulan Backward Chaining:</b><br>
        ${conclusions.map((p) => `<div>${p}</div>`).join("")}
      </div>
    `;
  } else {
    finalConclusionEl.innerHTML = `
      <div style="padding:12px;background:#fff0f0;border-left:4px solid var(--danger);border-radius:8px;">
        <b>Tidak ada rule yang cocok sepenuhnya.</b><br>
        Ditampilkan persentase kecocokan.
      </div>
    `;
  }

  // Rekomendasi penanganan untuk hasil tertinggi
  (async () => {
    const penyakitData = await loadPenyakit();
    if (!penyakitData) return;

    const top = persentaseList[0];
    if (penyakitData[top.penyakit]) {
      document.getElementById("rekomendasi").innerHTML =
        penyakitData[top.penyakit].penanganan;
    }
  })();

  // navigasi
  document
    .getElementById("back-gejala")
    .addEventListener("click", () => (window.location.href = "gejala.html"));

  // simpan riwayat diagnosa
  document.getElementById("save-history").addEventListener("click", () => {
    const waktu = new Date().toLocaleString();
    const record = {
      waktu,
      user,
      selected,
      hasil: persentaseList,
      conclusions
    };

    const prev = JSON.parse(localStorage.getItem("riwayat_diagnosa") || "[]");
    prev.unshift(record);

    localStorage.setItem("riwayat_diagnosa", JSON.stringify(prev));
    alert("Riwayat diagnosa disimpan!");
  });
}

// =============================
// INFORMASI.HTML — Menampilkan Informasi Penyakit
// =============================
if (document.getElementById("info-container")) {

  const box = document.getElementById("info-container");

  loadPenyakit().then(data => {
    if (!data) {
      box.innerHTML = "<div class='small-muted'>Gagal memuat informasi penyakit.</div>";
      return;
    }

    let html = "";

    for (const key in data) {
      if (!data[key].jenis) continue;

      html += `
        <div style="margin-bottom:20px; border-bottom:1px solid #eef3ff; padding-bottom:14px;">
          <h2 style="margin:0; color:var(--primary);">${key}</h2>
          <div class="small-muted">Jenis: ${data[key].jenis} — Skala: ${data[key].skala}</div>

          <div style="margin-top:10px;">
            <b>Keterangan:</b><br>
            <span class="small-muted">${data[key].keterangan}</span>
          </div>

          <div style="margin-top:10px;">
            <b>Penanganan:</b><br>
            <span class="small-muted">${data[key].penanganan}</span>
          </div>
        </div>
      `;
    }

    box.innerHTML = html;
  });

  // tombol kembali
  document.getElementById("back-home").addEventListener("click", () => {
    window.location.href = "index.html";
  });
}


// =============================
// RIWAYAT.HTML
// =============================
if (document.getElementById("history-table")) {
  const tbody = document.querySelector("#history-table tbody");
  const data = JSON.parse(localStorage.getItem("riwayat_diagnosa") || "[]");

  if (data.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="small-muted">Belum ada riwayat.</td></tr>';
  } else {
    tbody.innerHTML = "";
    data.forEach((item) => {
      const top = item.hasil.sort((a, b) => b.persen - a.persen)[0];

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.waktu}</td>
        <td>${item.user.nama}</td>
        <td>${item.user.umur}</td>
        <td>${item.user.jk}</td>
        <td>${top.penyakit} (${top.persen}%)</td>
        <td><button class="btn ghost" onclick='viewDetail(\`${encodeURIComponent(
          JSON.stringify(item)
        )}\`)'>Lihat</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  document
    .getElementById("clear-history")
    .addEventListener("click", () => {
      if (confirm("Hapus semua riwayat?")) {
        localStorage.removeItem("riwayat_diagnosa");
        location.reload();
      }
    });

  document
    .getElementById("back-home")
    .addEventListener("click", () => (window.location.href = "index.html"));
}

// lihat detail riwayat
window.viewDetail = function (encoded) {
  const item = JSON.parse(decodeURIComponent(encoded));
  let msg = `Nama: ${item.user.nama}\nUmur: ${item.user.umur}\nJK: ${item.user.jk}\nWaktu: ${item.waktu}\n\nHasil:\n`;

  item.hasil.forEach((h) => {
    msg += `- ${h.penyakit}: ${h.persen}% (${h.cocok}/${h.total})\n`;
  });

  if (item.conclusions.length > 0) {
    msg += `\nKesimpulan Backward Chaining:\n`;
    item.conclusions.forEach((c) => (msg += `- ${c}\n`));
  }

  alert(msg);
};
