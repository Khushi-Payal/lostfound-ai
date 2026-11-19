'use client';

import { useId } from 'react';
import { CITIES_BY_STATE, INDIAN_STATES } from '../../lib/constants';

export function StateCityFields({ state, city, onStateChange, onCityChange, required = true, idPrefix = 'location' }) {
  const id = useId().replace(/:/g, '');
  const stateId = `${idPrefix}-state-${id}`;
  const cityId = `${idPrefix}-city-${id}`;
  const cities = CITIES_BY_STATE[state] || [];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label className="field-label" htmlFor={stateId}>State / Union Territory{required && <span className="ml-1 text-rose-500">*</span>}</label><select id={stateId} value={state} onChange={(event) => { onStateChange(event.target.value); if (city && !(CITIES_BY_STATE[event.target.value] || []).includes(city)) onCityChange(''); }} required={required} className="select"><option value="">Choose a state</option>{INDIAN_STATES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
      <div><label className="field-label" htmlFor={cityId}>City{required && <span className="ml-1 text-rose-500">*</span>}</label><input id={cityId} value={city} onChange={(event) => onCityChange(event.target.value)} required={required} list={`${cityId}-list`} className="input" placeholder={state ? 'Choose or enter a city' : 'Select state first'} autoComplete="address-level2" /><datalist id={`${cityId}-list`}>{cities.map((entry) => <option key={entry} value={entry} />)}</datalist></div>
    </div>
  );
}
