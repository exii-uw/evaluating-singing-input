export const radioButtonValidator = (val: any) => (typeof val === 'string' ? undefined : 'Select a radio button');
export const checkboxValidator = (val: any) => (Array.isArray(val) && val.length > 0 ? undefined : 'Select at least one checkbox');
export const textFieldValidator = (val: any) => (typeof val === 'string' ? undefined : 'This field is required');
export const numberValidator = (val: any) => (typeof val === 'string' && !isNaN(+val) ? undefined : 'Your response should be a number');
