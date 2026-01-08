import {
  EditDatumFormCreator,
  NewRelFormCreator,
  SelectField,
} from "../types/form";
import * as icons from "./icons";

export function getHtmlNew(form_creator: NewRelFormCreator) {
  return ` 
    <form id="familyForm" class="f3-form">
      ${closeBtn()}
      <h3 class="f3-form-title">${form_creator.title}</h3>



      ${
        form_creator.linkExistingRelative
          ? addLinkExistingRelative(form_creator)
          : ""
      }
    </form>
  `;
}

export function getHtmlEdit(form_creator: EditDatumFormCreator) {
  const readOnlyFormCreator = {
    ...form_creator,
    force_info_only: true,
  } as EditDatumFormCreator & { force_info_only: boolean };
  return ` 
     <form id="familyForm" class="f3-form ${
       form_creator.editable ? "" : "non-editable"
     }">
      ${closeBtn()}
      <div style="text-align: right; display: 'block'">
        ${!form_creator.no_edit ? addRelativeBtn(form_creator) : ""}
        ${form_creator.no_edit ? spaceDiv() : editBtn(form_creator)}
      </div>

      ${fields(readOnlyFormCreator)}

      ${
        form_creator.linkExistingRelative
          ? addLinkExistingRelative(form_creator)
          : ""
      }

      <hr>
      ${deleteBtn(form_creator)}

      ${externalEditBtn(form_creator)}

    </form>
  `;
}

function deleteBtn(form_creator: EditDatumFormCreator) {
  return `
    <div>
      <button type="button" class="f3-delete-btn" ${
        form_creator.can_delete ? "" : "disabled"
      }>
        Delete
      </button>
    </div>
  `;
}

function externalEditBtn(
  form_creator: EditDatumFormCreator & {
    external_edit_url?: string;
    external_edit_label?: string;
  }
) {
  // Không cấu hình URL thì không hiện nút
  if (!form_creator.external_edit_url) return "";

  const label = form_creator.external_edit_label || "Chỉnh sửa thông tin";

  return `
    <div>
      <button
        type="button"
        class="f3-external-edit-btn"
        data-edit-url="${form_creator.external_edit_url}"
      >
        ${label}
      </button>
    </div>
  `;
}

function removeRelativeBtn(form_creator: EditDatumFormCreator) {
  return `
    <div>
      <button type="button" class="f3-remove-relative-btn${
        form_creator.removeRelativeActive ? " active" : ""
      }">
        ${
          form_creator.removeRelativeActive
            ? "Cancel Remove Relation"
            : "Remove Relation"
        }
      </button>
    </div>
  `;
}

function addRelativeBtn(form_creator: EditDatumFormCreator) {
  return `
    <span class="f3-add-relative-btn">
      ${
        form_creator.addRelativeActive
          ? icons.userPlusCloseSvgIcon()
          : icons.userPlusSvgIcon()
      }
    </span>
  `;
}

function editBtn(form_creator: EditDatumFormCreator) {
  return `
    <span class="f3-edit-btn">
      ${
        form_creator.editable ? icons.pencilOffSvgIcon() : icons.pencilSvgIcon()
      }
    </span>
  `;
}

function genderRadio(form_creator: EditDatumFormCreator | NewRelFormCreator) {
  if (!form_creator.editable) return "";
  return `
    <div class="f3-radio-group">
      ${form_creator.gender_field.options
        .map(
          (option) => `
        <label>
          <input type="radio" name="${form_creator.gender_field.id}" 
            value="${option.value}" 
            ${
              option.value === form_creator.gender_field.initial_value
                ? "checked"
                : ""
            }
            ${form_creator.gender_field.disabled ? "disabled" : ""}
          >
          ${option.label}
        </label>
      `
        )
        .join("")}
    </div>
  `;
}

function genderInfoField(
  form_creator: EditDatumFormCreator | NewRelFormCreator
) {
  const g = form_creator.gender_field;

  // Nếu không có cấu hình giới tính thì bỏ qua
  if (!g || !Array.isArray(g.options)) return "";

  // Label hiển thị, nếu không có thì dùng "Giới tính"
  const label = (g as any).label || "Giới tính";

  // Tìm option đang được chọn theo initial_value
  const selected = g.options.find((opt) => opt.value === g.initial_value);
  const text = selected ? selected.label : "";

  // Nếu chưa có giá trị giới tính thì cũng có thể ẩn luôn dòng này
  if (!text) return "";

  // Hiển thị giống các info-field khác
  return `
    <div class="f3-info-field">
      <span class="f3-info-field-label">${label}</span>
      <span class="f3-info-field-value">${text}</span>
    </div>
  `;
}

function fields(form_creator: EditDatumFormCreator | NewRelFormCreator) {
  const forceInfoOnly = (form_creator as any).force_info_only === true;

  // ✅ Tách image fields ra để luôn render lên đầu
  const imageFields = form_creator.fields.filter((f: any) => f.type === "image");
  const otherFields = form_creator.fields.filter((f: any) => f.type !== "image");

  // ✅ Render avatar/header (nếu có)
  const imageHeaderHtml = renderImageHeader(imageFields);

  if (!form_creator.editable || forceInfoOnly) {
    return imageHeaderHtml + infoField(otherFields);
  }

  let fields_html = imageHeaderHtml;

  otherFields.forEach((field: any) => {
    if (field.type === "text") {
      const isGender = field.id === "gender";
      const rawValue = field.initial_value || "";
      const displayValue = isGender ? normalizeGender(rawValue) : rawValue;

      fields_html += `
      <div class="f3-form-field">
        <label>${field.label}</label>
        <input type="text"
          name="${field.id}"
          value="${escapeHtmlAttr(displayValue)}"
          placeholder="${escapeHtmlAttr(field.label)}">
      </div>`;
    } else if (field.type === "textarea") {
      fields_html += `
      <div class="f3-form-field">
        <label>${field.label}</label>
        <textarea name="${field.id}"
          placeholder="${escapeHtmlAttr(field.label)}">${escapeHtmlText(
        field.initial_value || ""
      )}</textarea>
      </div>`;
    } else if (field.type === "select") {
      const select_field = field as SelectField;

      fields_html += `
      <div class="f3-form-field">
        <label>${select_field.label}</label>
        <select name="${select_field.id}">
          <option value="">${
            select_field.placeholder || `Select ${select_field.label}`
          }</option>
          ${select_field.options
            .map((option) => {
              const selected =
                option.value === select_field.initial_value ? "selected" : "";
              return `<option ${selected} value="${escapeHtmlAttr(
                option.value
              )}">${escapeHtmlText(option.label)}</option>`;
            })
            .join("")}
        </select>
      </div>`;
    } else if (field.type === "rel_reference") {
      fields_html += `
      <div class="f3-form-field">
        <label>${field.label} - <i>${field.rel_label}</i></label>
        <input type="text"
          name="${field.id}"
          value="${escapeHtmlAttr(field.initial_value || "")}"
          placeholder="${escapeHtmlAttr(field.label)}">
      </div>`;
    }
  });

  return fields_html;

  // --------------------------
  // Helpers
  // --------------------------

  function renderImageHeader(fields: any[]) {
    if (!fields || fields.length === 0) return "";

    // bạn có thể hỗ trợ nhiều ảnh; ở đây lấy cái đầu tiên làm avatar
    const avatarField = fields[0];
    const src = avatarField?.initial_value || "";
    if (!src) return "";

    const label = avatarField?.label || "";

    // ✅ UI avatar nằm trên cùng
    return `
      <div class="f3-form-avatar">
        ${label ? `<div class="f3-form-avatar-label">${escapeHtmlText(label)}</div>` : ""}
        <img class="f3-form-avatar-img" src="${escapeHtmlAttr(src)}" alt="avatar">
      </div>
    `;
  }

  function infoField(fieldsList: any[]) {
    let fields_html = "";

    fieldsList.forEach((field: any) => {
      if (field.type === "rel_reference") {
        if (!field.initial_value) return;
        fields_html += `
        <div class="f3-info-field">
          <span class="f3-info-field-label">${field.label} - <i>${field.rel_label}</i></span>
          <span class="f3-info-field-value">${escapeHtmlText(field.initial_value || "")}</span>
        </div>`;
      } else if (field.type === "select") {
        const select_field = field as SelectField;
        if (!select_field.initial_value) return;
        const label =
          select_field.options.find(
            (option) => option.value === select_field.initial_value
          )?.label || "";
        fields_html += `
        <div class="f3-info-field">
          <span class="f3-info-field-label">${select_field.label}</span>
          <span class="f3-info-field-value">${escapeHtmlText(label)}</span>
        </div>`;
      } else {
        const isGender = field.id === "gender";
        const rawValue = field.initial_value || "";
        const displayValue = isGender ? normalizeGender(rawValue) : rawValue;

        fields_html += `
        <div class="f3-info-field">
          <span class="f3-info-field-label">${field.label}</span>
          <span class="f3-info-field-value">${escapeHtmlText(displayValue)}</span>
        </div>`;
      }
    });

    return fields_html;
  }

  function escapeHtmlAttr(value: any) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeHtmlText(value: any) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}


function normalizeGender(value: string): string {
  const v = value.trim().toUpperCase();
  if (v === "M" || v === "NAM") return "Nam";
  if (v === "F" || v === "NU" || v === "NỮ") return "Nữ";
  return value; // nếu là text khác thì giữ nguyên
}

function addLinkExistingRelative(
  form_creator: EditDatumFormCreator | NewRelFormCreator
) {
  const title = form_creator.linkExistingRelative.hasOwnProperty("title")
    ? form_creator.linkExistingRelative.title
    : "Profile already exists?";

  const select_placeholder = form_creator.linkExistingRelative.hasOwnProperty(
    "select_placeholder"
  )
    ? form_creator.linkExistingRelative.select_placeholder
    : "Select profile";

  const options = form_creator.linkExistingRelative
    .options as SelectField["options"];

  // Serialize options & placeholder để JS ở dưới có thể đọc lại
  const dataOptions = encodeURIComponent(JSON.stringify(options));
  const dataPlaceholder = encodeURIComponent(select_placeholder);

  return `
    <div
      class="f3-link-existing-wrapper"
      data-options="${dataOptions}"
      data-placeholder="${dataPlaceholder}"
    >
      <hr>
      <div class="f3-link-existing-relative">
        <label>${title}</label>

        <input
          type="text"
          class="f3-link-existing-search"
          placeholder="Tìm kiếm..."
        />

        <!-- size="10" => list box hiển thị tối đa 10 dòng, phần còn lại scroll -->
        <select class="f3-link-existing-select" size="10">
          <option value="">${select_placeholder}</option>
          ${options
            .map(
              (option) =>
                `<option value="${option.value}">${option.label}</option>`
            )
            .join("")}
        </select>
      </div>
    </div>
  `;
}

function closeBtn() {
  return `
    <span class="f3-close-btn">
      ×
    </span>
  `;
}

function spaceDiv() {
  return `<div style="height: 24px;"></div>`;
}

type LinkExistingOption = { value: string; label: string };

function renderLinkExistingOptions(wrapper: HTMLElement, keyword: string) {
  const select = wrapper.querySelector<HTMLSelectElement>(
    ".f3-link-existing-select"
  );
  if (!select) return;

  const rawOptions = wrapper.dataset.options
    ? decodeURIComponent(wrapper.dataset.options)
    : "[]";

  let options: LinkExistingOption[];
  try {
    options = JSON.parse(rawOptions);
  } catch {
    options = [];
  }

  const placeholder = wrapper.dataset.placeholder
    ? decodeURIComponent(wrapper.dataset.placeholder)
    : "Select profile";

  const normalized = keyword.toLowerCase().trim();

  const filtered = normalized
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(normalized) ||
          opt.value.toLowerCase().includes(normalized)
      )
    : options;

  // Xóa hết option cũ
  select.innerHTML = "";

  // Thêm lại placeholder
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.appendChild(placeholderOption);

  // Thêm các option đã lọc
  filtered.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    select.appendChild(o);
  });
}

// Event delegation: chỉ chạy ở môi trường browser
if (typeof document !== "undefined") {
  // Search trong link existing
  document.addEventListener("input", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target || !target.classList.contains("f3-link-existing-search"))
      return;

    const wrapper = target.closest(
      ".f3-link-existing-wrapper"
    ) as HTMLElement | null;
    if (!wrapper) return;

    const input = target as HTMLInputElement;
    renderLinkExistingOptions(wrapper, input.value || "");
  });

  // Click external edit
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const btn = target.closest(".f3-external-edit-btn") as HTMLElement | null;
    if (!btn) return;

    const url = btn.getAttribute("data-edit-url");
    if (!url) return;

    window.open(url, '_blank', 'noopener,noreferrer');
  });
}
