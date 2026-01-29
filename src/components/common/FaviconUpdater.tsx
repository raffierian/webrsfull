import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export const FaviconUpdater = () => {
    const { settings } = useSettings();

    useEffect(() => {
        if (settings?.faviconUrl) {
            const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = settings.faviconUrl;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [settings?.faviconUrl]);

    return null;
};
