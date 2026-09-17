export interface RuleCondition {
  field?: string;
  operator?: string;
  value?: any;
  logical?: 'AND' | 'OR' | 'NOT';
  conditions?: RuleCondition[];
  condition?: RuleCondition;
}

export interface EvaluationResult {
  isEligible: boolean;
  status: 'Eligible' | 'Not Eligible' | 'Needs Verification';
  matchPercent: number;
  details: {
    satisfied: { description: string; field: string; required: string; actual: string }[];
    failed: { description: string; field: string; required: string; actual: string }[];
    missing: { description: string; field: string }[];
  };
}

// Map database profile fields to user-friendly labels (supports multi-language translations dynamically)
export const FIELD_LABELS: Record<string, { en: string; hi: string; mr: string }> = {
  age: { en: 'Age', hi: 'आयु', mr: 'वय' },
  annualIncome: { en: 'Annual Income', hi: 'वार्षिक आय', mr: 'वार्षिक उत्पन्न' },
  gender: { en: 'Gender', hi: 'लिंग', mr: 'लिंग' },
  state: { en: 'State of Residence', hi: 'निवास का राज्य', mr: 'रहिवासी राज्य' },
  areaType: { en: 'Area Type (Rural/Urban)', hi: 'क्षेत्र प्रकार (ग्रामीण/शहरी)', mr: 'क्षेत्र प्रकार (ग्रामीण/शहरी)' },
  occupation: { en: 'Occupation', hi: 'व्यवसाय', mr: 'व्यवसाय' },
  employmentStatus: { en: 'Employment Status', hi: 'रोजगार की स्थिति', mr: 'रोजगार स्थिती' },
  education: { en: 'Education Level', hi: 'शिक्षा का स्तर', mr: 'शिक्षण पातळी' },
  casteCategory: { en: 'Caste Category', hi: 'जाति श्रेणी', mr: 'जात प्रवर्ग' },
  isEws: { en: 'EWS Status', hi: 'ईडब्ल्यूएस स्थिति', mr: 'EWS स्थिती' },
  isDifferentlyAbled: { en: 'Differently Abled Status', hi: 'दिव्यांग स्थिति', mr: 'दिव्यांग स्थिती' },
  isStudent: { en: 'Student Status', hi: 'छात्र स्थिति', mr: 'विद्यार्थी स्थिती' },
  isFarmer: { en: 'Farmer Status', hi: 'किसान स्थिति', mr: 'शेतकरी स्थिती' },
  isSeniorCitizen: { en: 'Senior Citizen Status', hi: 'वरिष्ठ नागरिक स्थिति', mr: 'ज्येष्ठ नागरिक स्थिती' },
  landOwned: { en: 'Land Owned (Acres)', hi: 'स्वामित्व वाली भूमि (एकड़)', mr: 'मालकीची जमीन (एकड)' },
  familySize: { en: 'Family Size', hi: 'परिवार का आकार', mr: 'कुटुंब आकार' },
  housingStatus: { en: 'Housing Status', hi: 'आवास की स्थिति', mr: 'गृहनिर्माण स्थिती' },
};

function formatValue(val: any): string {
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  if (val === null || val === undefined) return 'Not Provided';
  if (typeof val === 'number') {
    if (val > 1000) return `₹${val.toLocaleString('en-IN')}`;
    return val.toString();
  }
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}

function generateConditionDesc(field: string, op: string, expectedVal: any): string {
  const label = FIELD_LABELS[field]?.en || field;
  const formattedVal = formatValue(expectedVal);

  switch (op) {
    case '==':
    case '=':
      return `${label} must be ${formattedVal}`;
    case '!=':
      return `${label} must not be ${formattedVal}`;
    case '>':
      return `${label} must be greater than ${formattedVal}`;
    case '<':
      return `${label} must be less than ${formattedVal}`;
    case '>=':
      return `${label} must be at least ${formattedVal}`;
    case '<=':
      return `${label} must be at most ${formattedVal}`;
    case 'IN':
      return `${label} must be one of: ${formattedVal}`;
    case 'NOT IN':
      return `${label} must not be one of: ${formattedVal}`;
    default:
      return `${label} ${op} ${formattedVal}`;
  }
}

// Evaluate a single leaf condition
function evaluateLeaf(condition: RuleCondition, profile: any): {
  satisfied: boolean;
  isMissing: boolean;
  desc: string;
  field: string;
  required: string;
  actual: string;
} {
  const { field, operator, value } = condition;
  if (!field || !operator) {
    return { satisfied: false, isMissing: true, desc: 'Invalid Rule', field: '', required: '', actual: '' };
  }

  const actualVal = profile[field];
  const desc = generateConditionDesc(field, operator, value);

  if (actualVal === undefined || actualVal === null) {
    return {
      satisfied: false,
      isMissing: true,
      desc,
      field,
      required: formatValue(value),
      actual: 'Not Provided',
    };
  }

  let satisfied = false;

  switch (operator) {
    case '=':
    case '==':
      satisfied = actualVal === value;
      break;
    case '!=':
      satisfied = actualVal !== value;
      break;
    case '>':
      satisfied = Number(actualVal) > Number(value);
      break;
    case '<':
      satisfied = Number(actualVal) < Number(value);
      break;
    case '>=':
      satisfied = Number(actualVal) >= Number(value);
      break;
    case '<=':
      satisfied = Number(actualVal) <= Number(value);
      break;
    case 'IN':
      satisfied = Array.isArray(value)
        ? value.includes(actualVal)
        : String(value).split(',').map(s => s.trim()).includes(actualVal);
      break;
    case 'NOT IN':
      satisfied = Array.isArray(value)
        ? !value.includes(actualVal)
        : !String(value).split(',').map(s => s.trim()).includes(actualVal);
      break;
    default:
      satisfied = false;
  }

  return {
    satisfied,
    isMissing: false,
    desc,
    field,
    required: formatValue(value),
    actual: formatValue(actualVal),
  };
}

// Recursively evaluate any node (logical or leaf)
export function evaluateRule(ruleJson: any, profile: any): EvaluationResult {
  const result: EvaluationResult = {
    isEligible: false,
    status: 'Not Eligible',
    matchPercent: 0,
    details: { satisfied: [], failed: [], missing: [] },
  };

  if (!ruleJson) {
    // If no rules, scheme is open to everyone
    result.isEligible = true;
    result.status = 'Eligible';
    result.matchPercent = 100;
    return result;
  }

  const parsedRule: RuleCondition = typeof ruleJson === 'string' ? JSON.parse(ruleJson) : ruleJson;

  // Helper function to recursively traverse and check conditions
  function traverse(node: RuleCondition): { ok: boolean; total: number; met: number } {
    if (node.logical) {
      if (node.logical === 'AND') {
        const subResults = (node.conditions || []).map(traverse);
        const ok = subResults.every(r => r.ok);
        const total = subResults.reduce((sum, r) => sum + r.total, 0);
        const met = subResults.reduce((sum, r) => sum + r.met, 0);
        return { ok, total, met };
      } else if (node.logical === 'OR') {
        const subResults = (node.conditions || []).map(traverse);
        const ok = subResults.some(r => r.ok);
        // For OR conditions, we take the maximum progress among matching/sub-conditions
        const total = subResults.reduce((sum, r) => sum + r.total, 0);
        const met = ok ? total : subResults.reduce((sum, r) => sum + r.met, 0);
        return { ok, total, met };
      } else if (node.logical === 'NOT') {
        const subResult = traverse(node.condition!);
        return { ok: !subResult.ok, total: 1, met: !subResult.ok ? 1 : 0 };
      }
    }

    // Leaf node
    const leaf = evaluateLeaf(node, profile);
    if (leaf.isMissing) {
      result.details.missing.push({ description: leaf.desc, field: leaf.field });
      return { ok: false, total: 1, met: 0 };
    }

    const item = {
      description: leaf.desc,
      field: leaf.field,
      required: leaf.required,
      actual: leaf.actual,
    };

    if (leaf.satisfied) {
      result.details.satisfied.push(item);
      return { ok: true, total: 1, met: 1 };
    } else {
      result.details.failed.push(item);
      return { ok: false, total: 1, met: 0 };
    }
  }

  const evaluation = traverse(parsedRule);

  result.isEligible = evaluation.ok;
  
  if (result.details.missing.length > 0) {
    result.status = evaluation.ok ? 'Needs Verification' : 'Not Eligible';
  } else {
    result.status = evaluation.ok ? 'Eligible' : 'Not Eligible';
  }

  // Calculate matching score
  // If no conditions defined, it is 100%
  const totalChecks = evaluation.total;
  if (totalChecks > 0) {
    result.matchPercent = Math.round((evaluation.met / totalChecks) * 100);
  } else {
    result.matchPercent = 100;
  }

  return result;
}
