import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';


const HtmlTemplate = () => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const response = await fetch('/template.html');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const text = await response.text();
        const sanitizedContent = DOMPurify.sanitize(text, { ADD_TAGS: ["script"], ADD_ATTR: ["src", "async", "defer"] });
        setHtmlContent(sanitizedContent);
      } catch (error) {
        console.error('Error fetching the HTML:', error);
      }
    };

    fetchHtml();
  }, []);

  return (        
        
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

  );
};

export default HtmlTemplate;





//"IBDG64ufMGwKSPSsA5nCfGZGgXv9kRRf"