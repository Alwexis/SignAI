import React from 'react';
import type { SVGProps } from 'react';

const Voiceprint = (props: SVGProps<SVGSVGElement>) => {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M5 7h2v10H5zm-4 3h2v4H1zm8-8h2v18H9zm4 2h2v18h-2zm4 3h2v10h-2zm4 3h2v4h-2z"></path></svg>);
}

const CameraLens = (props: SVGProps<SVGSVGElement>) => {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M9.827 21.763L14.31 14l3.532 6.118A9.96 9.96 0 0 1 12 22c-.746 0-1.473-.082-2.173-.237M7.89 21.12A10.03 10.03 0 0 1 2.458 15h8.965zM2.05 13Q2 12.507 2 12c0-2.607.998-4.981 2.632-6.761L9.113 13zm4.109-9.117A9.96 9.96 0 0 1 12 2c.746 0 1.473.082 2.173.237L9.69 10zM16.11 2.88A10.03 10.03 0 0 1 21.542 9h-8.965zM21.95 11q.05.493.05 1a9.96 9.96 0 0 1-2.632 6.761L14.887 11z"></path></svg>);
}

const _icons: any = {
    "voice": Voiceprint,
    "camera": CameraLens,
}

type IconProps = {
    icon: keyof typeof _icons; // Las claves del objeto _icons.
} & React.SVGProps<SVGSVGElement>; // Ajusta según los props adicionales esperados.

export default function Icon({ icon, ...props }: IconProps) {
    const IconComponent = _icons[icon];
    if (!IconComponent) {
        console.error(`Icon "${icon.toString()}" not found. Ensure it matches a key in _icons.`);
        return null;
    }
    return <IconComponent {...props} />;
}