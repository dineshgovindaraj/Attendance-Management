export interface FormData {
  id: string;
  type: 'od' | 'leave';
  name: string;
  regNo: string;
  class: string;
  section: string;
  from: string;
  to: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  mentorMessage?: string;
  adminMessage?: string;
}

export const saveForms = (forms: FormData[]) => {
  localStorage.setItem('studentForms', JSON.stringify(forms));
};

export const getForms = (): FormData[] => {
  const forms = localStorage.getItem('studentForms');
  return forms ? JSON.parse(forms) : [];
};

export const addForm = (form: Omit<FormData, 'id' | 'status' | 'submittedAt'>) => {
  const forms = getForms();
  const newForm = {
    ...form,
    id: Math.random().toString(36).substr(2, 9),
    status: 'pending',
    submittedAt: new Date().toISOString(),
  } as FormData;
  forms.push(newForm);
  saveForms(forms);
  return newForm;
};

export const updateFormStatus = (formId: string, status: 'pending' | 'approved' | 'rejected', message?: string, isMentor: boolean = true) => {
  const forms = getForms();
  const formIndex = forms.findIndex(f => f.id === formId);
  if (formIndex !== -1) {
    forms[formIndex] = {
      ...forms[formIndex],
      status,
      [isMentor ? 'mentorMessage' : 'adminMessage']: message
    };
    saveForms(forms);
    return forms[formIndex];
  }
  return null;
};