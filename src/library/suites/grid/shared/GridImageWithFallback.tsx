import React, { useEffect, useState } from 'react';
import { Disc } from 'lucide-react';

// src/library/suites/grid/shared/GridImageWithFallback.tsx
// Keeps remote cover failures visible as a stable placeholder instead of leaving an empty card.

export interface GridImageWithFallbackProps {
    src: string;
    alt: string;
    className?: string;
    fallbackClassName?: string;
    fallbackSize?: number;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'sync' | 'auto';
    draggable?: boolean;
    onLoad?: React.ReactEventHandler<HTMLImageElement>;
}

export const GridImageWithFallback: React.FC<GridImageWithFallbackProps> = ({
    src,
    alt,
    className,
    fallbackClassName = 'absolute inset-0 flex items-center justify-center bg-zinc-300/40 dark:bg-zinc-700/40',
    fallbackSize = 48,
    loading = 'lazy',
    decoding = 'async',
    draggable,
    onLoad,
}) => {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (failed) {
        return (
            <div className={fallbackClassName} aria-hidden="true">
                <Disc size={fallbackSize} className="opacity-20" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading={loading}
            decoding={decoding}
            draggable={draggable}
            onLoad={onLoad}
            onError={() => setFailed(true)}
            className={className}
        />
    );
};

