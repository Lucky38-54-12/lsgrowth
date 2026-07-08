// Forgiving CSV import for Apollo.io exports — Apollo's column names shift
// between export types, so we fuzzy-match on normalized header text rather
// than expecting an exact schema.

export interface ApolloRow {
  company: string;
  website: string;
  contact_name: string;
  email: string;
  phone: string;
  employee_count: number | null;
  location: string;
  trade: string;
}

// Splits one CSV line respecting double-quoted fields (with "" escapes).
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { out.push(field); field = ""; }
      else field += c;
    }
  }
  out.push(field);
  return out.map(f => f.trim());
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const FIELD_ALIASES: Record<keyof ApolloRow | "first_name" | "last_name", string[]> = {
  company: ["company", "companyname", "organization", "accountname"],
  website: ["website", "companywebsite", "domain", "companydomain"],
  contact_name: ["fullname", "name", "contactname"],
  first_name: ["firstname"],
  last_name: ["lastname"],
  email: ["email", "emailaddress"],
  phone: ["phone", "phonenumber", "companyphone", "workdirectphone", "mobilephone"],
  employee_count: ["employees", "numemployees", "companyemployees", "employeecount", "numberofemployees"],
  location: ["city", "companycity", "location", "state", "companystate"],
  trade: ["industry", "companyindustry", "keywords"],
};

function findColumn(headers: string[], aliases: string[]): number {
  for (const alias of aliases) {
    const idx = headers.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseApolloCsv(raw: string): ApolloRow[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n").filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const rawHeaders = splitCsvLine(lines[0]);
  const headers = rawHeaders.map(normalizeHeader);

  const idx = {
    company: findColumn(headers, FIELD_ALIASES.company),
    website: findColumn(headers, FIELD_ALIASES.website),
    contact_name: findColumn(headers, FIELD_ALIASES.contact_name),
    first_name: findColumn(headers, FIELD_ALIASES.first_name),
    last_name: findColumn(headers, FIELD_ALIASES.last_name),
    email: findColumn(headers, FIELD_ALIASES.email),
    phone: findColumn(headers, FIELD_ALIASES.phone),
    employee_count: findColumn(headers, FIELD_ALIASES.employee_count),
    location: findColumn(headers, FIELD_ALIASES.location),
    trade: findColumn(headers, FIELD_ALIASES.trade),
  };

  const rows: ApolloRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const get = (i: number) => (i >= 0 && cols[i] ? cols[i].trim() : "");

    let contact_name = get(idx.contact_name);
    if (!contact_name) contact_name = [get(idx.first_name), get(idx.last_name)].filter(Boolean).join(" ");

    const empRaw = get(idx.employee_count).replace(/[,+]/g, "");
    const employee_count = empRaw && /^\d+$/.test(empRaw) ? parseInt(empRaw, 10) : null;

    const company = get(idx.company);
    if (!company) continue; // skip rows with no business name — nothing to import

    rows.push({
      company,
      website: get(idx.website),
      contact_name,
      email: get(idx.email),
      phone: get(idx.phone),
      employee_count,
      location: get(idx.location),
      trade: get(idx.trade),
    });
  }
  return rows;
}
