import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const TradingViewWidget = ({ symbol, theme = 'dark', studies = [] }) => {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: `STELLAR:${symbol}`,
          interval: '30',
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: container.current.id,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'BB@tv-basicstudies',
            ...studies
          ],
          studies_overrides: {
            "volume.volume.color.0": "rgba(255,82,82, 0.8)",
            "volume.volume.color.1": "rgba(76,175,80, 0.8)",
          },
          overrides: {
            "mainSeriesProperties.candleStyle.upColor": "#4CAF50",
            "mainSeriesProperties.candleStyle.downColor": "#FF5252",
            "mainSeriesProperties.candleStyle.wickUpColor": "#4CAF50",
            "mainSeriesProperties.candleStyle.wickDownColor": "#FF5252"
          }
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [symbol, theme, studies]);

  return (
    <Box 
      id={`tradingview_${symbol}`}
      ref={container}
      sx={{ 
        height: '100%', 
        width: '100%',
        '& iframe': {
          border: 'none'
        }
      }}
    />
  );
};

export default TradingViewWidget; 