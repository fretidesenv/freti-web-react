
import React, { useState } from 'react';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

function ImageZoom({ title, source, height, width }) {
    return (
        <Zoom>
            <img
                alt={title}
                src={source}
                style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'contain',
                }}
                // width={width}
                // height={height}
            />
        </Zoom>
    );
}

export default ImageZoom;