'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, Save } from 'lucide-react';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

function calcPercent(form: any): number {
  const fields = [form.dob, form.gender, form.state, form.district, form.areaType, form.annualIncome, form.occupation, form.employmentStatus, form.education, form.casteCategory, form.housingStatus, form.familySize > 1 ? true : null];
  const filled = fields.filter(f => f !== null && f !== undefined && f !== '').length;
  return Math.round((filled / fields.length) * 100);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
  ...rest
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <select className="input-field" value={value || ''} onChange={onChange} {...rest}>
      <option value="">— Select —</option>
      {children}
    </select>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-saffron' : 'bg-gray-200'}`} />
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState<any>({
    dob: '', gender: '', state: '', district: '', areaType: '',
    annualIncome: '', occupation: '', employmentStatus: '', education: '',
    casteCategory: '', isEws: false, isDifferentlyAbled: false, isStudent: false,
    isFarmer: false, isSeniorCitizen: false, familySize: 1, dependentsCount: 0,
    housingStatus: '', landOwned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/users/profile').then(r => r.json()).then(d => {
      if (d.profile) setForm((prev: any) => ({ ...prev, ...d.profile }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));
  const completion = calcPercent(form);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const payload = { ...form, name: user?.name };
    await fetch('/api/users/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  if (loading) return (
    <DashboardLayout title="My Profile">
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-3xl space-y-6 animate-fade-in">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-navy">Eligibility Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in your details to get accurate scheme recommendations.</p>
        </div>

        {/* Completion */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-navy text-sm">Profile Completion</span>
            <span className={`text-sm font-bold ${completion >= 80 ? 'text-indiaGreen' : 'text-saffron'}`}>{completion}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${completion >= 80 ? 'bg-indiaGreen' : 'bg-saffron'}`}
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 100 && <p className="text-xs text-gray-400 mt-2">Complete your profile to improve scheme recommendations.</p>}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle size={16} />
            Profile updated successfully! Check your dashboard for updated recommendations.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Details */}
          <div className="card space-y-4">
            <h2 className="font-jakarta font-bold text-navy border-b border-gray-100 pb-3">Personal Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Date of Birth">
                <input type="date" className="input-field" value={form.dob || ''} onChange={e => set('dob', e.target.value)} />
              </Field>
              <Field label="Gender">
                <Select value={form.gender || ''} onChange={e => set('gender', e.target.value)}>
                  {['Male', 'Female', 'Transgender', 'Prefer Not to Say'].map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
              </Field>
              <Field label="State of Residence">
                <Select value={form.state || ''} onChange={e => set('state', e.target.value)}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="District">
                <input type="text" className="input-field" placeholder="e.g. Mumbai Suburbs" value={form.district || ''} onChange={e => set('district', e.target.value)} />
              </Field>
              <Field label="Area Type">
                <Select value={form.areaType || ''} onChange={e => set('areaType', e.target.value)}>
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </Select>
              </Field>
            </div>
          </div>

          {/* Financial & Employment */}
          <div className="card space-y-4">
            <h2 className="font-jakarta font-bold text-navy border-b border-gray-100 pb-3">Financial & Employment Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Annual Family Income (₹)">
                <input type="number" className="input-field" placeholder="e.g. 300000" value={form.annualIncome ?? ''} onChange={e => set('annualIncome', e.target.value)} />
              </Field>
              <Field label="Occupation">
                <Select value={form.occupation || ''} onChange={e => set('occupation', e.target.value)}>
                  {['Agriculture', 'Student', 'Business', 'Unemployed', 'Salaried', 'Retired', 'Homemaker', 'Others'].map(o => <option key={o} value={o}>{o}</option>)}
                </Select>
              </Field>
              <Field label="Employment Status">
                <Select value={form.employmentStatus || ''} onChange={e => set('employmentStatus', e.target.value)}>
                  {['Unemployed', 'Self-Employed', 'Salaried', 'Student', 'Retired'].map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Education Level">
                <Select value={form.education || ''} onChange={e => set('education', e.target.value)}>
                  {['Below 10th', '10th', '12th', 'Graduate', 'Post-Graduate', 'Professional'].map(e => <option key={e} value={e}>{e}</option>)}
                </Select>
              </Field>
              <Field label="Caste Category">
                <Select value={form.casteCategory || ''} onChange={e => set('casteCategory', e.target.value)}>
                  {['General', 'OBC', 'SC', 'ST'].map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Housing Status">
                <Select value={form.housingStatus || ''} onChange={e => set('housingStatus', e.target.value)}>
                  {['Owned', 'Rented', 'Homeless', 'Government Quarters'].map(h => <option key={h} value={h}>{h}</option>)}
                </Select>
              </Field>
            </div>
          </div>

          {/* Family */}
          <div className="card space-y-4">
            <h2 className="font-jakarta font-bold text-navy border-b border-gray-100 pb-3">Family & Property</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Family Size">
                <input type="number" min={1} max={20} className="input-field" value={form.familySize ?? 1} onChange={e => set('familySize', e.target.value === '' ? '' : Number(e.target.value))} />
              </Field>
              <Field label="No. of Dependents">
                <input type="number" min={0} max={20} className="input-field" value={form.dependentsCount ?? 0} onChange={e => set('dependentsCount', e.target.value === '' ? '' : Number(e.target.value))} />
              </Field>
              <Field label="Land Owned (Acres)">
                <input type="number" min={0} step={0.1} className="input-field" value={form.landOwned ?? 0} onChange={e => set('landOwned', e.target.value === '' ? '' : Number(e.target.value))} />
              </Field>
            </div>
          </div>

          {/* Special Status */}
          <div className="card space-y-4">
            <h2 className="font-jakarta font-bold text-navy border-b border-gray-100 pb-3">Special Status</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Toggle label="Economically Weaker Section (EWS)" checked={!!form.isEws} onChange={val => set('isEws', val)} />
              <Toggle label="Differently Abled (PwD)" checked={!!form.isDifferentlyAbled} onChange={val => set('isDifferentlyAbled', val)} />
              <Toggle label="Currently a Student" checked={!!form.isStudent} onChange={val => set('isStudent', val)} />
              <Toggle label="Farmer" checked={!!form.isFarmer} onChange={val => set('isFarmer', val)} />
              <Toggle label="Senior Citizen (60+)" checked={!!form.isSeniorCitizen} onChange={val => set('isSeniorCitizen', val)} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3.5 text-base">
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <><Save size={18} /> Save Profile & Check Eligibility</>
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
