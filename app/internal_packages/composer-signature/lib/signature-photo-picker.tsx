import React from 'react';
import { localized } from 'mailspring-exports';

export default class SignaturePhotoPicker extends React.Component<{
  data: any;
  onChange: (e: { target: { value: string; id?: string } }) => void;
}> {
  render() {
    const { data } = this.props;

    let source = data.photoURL || '';
    if (!['gravatar', 'company', ''].includes(source)) {
      source = 'custom';
    }

    return (
      <div className="field photo-picker">
        <label htmlFor="photoURL">Picture</label>
        <div className="photo-options">
          <select
            id="photoURL"
            tabIndex={-1}
            value={source || ''}
            onChange={this.props.onChange}
            style={{ display: 'block' }}
          >
            <option value="">{localized('None')}</option>
            <option value="gravatar">{localized('Gravatar Profile Photo')}</option>
            <option value="company">{localized('Company / Domain Logo')}</option>
            <option disabled>──────────</option>
            <option value="custom">{localized('Custom Image…')}</option>
          </select>
          {source === 'custom' && (
            <>
              <label htmlFor="photoURL" className="sr-only">
                {localized('Photo URL')}
              </label>
              <input
                type="url"
                id="photoURL"
                placeholder="http://"
                value={data.photoURL === 'custom' ? '' : data.photoURL}
                onChange={this.props.onChange}
              />
            </>
          )}
        </div>
      </div>
    );
  }
}
