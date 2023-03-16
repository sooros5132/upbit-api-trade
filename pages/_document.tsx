import Document, { Html, Main, Head, NextScript } from 'next/document';
class CustomDocument extends Document {
  render() {
    return (
      <Html lang='ko' data-theme='black'>
        <Head>
          <meta charSet='utf-8' />
          <link rel='icon' href='/favicon.ico' />
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
          <link
            href='https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&family=Roboto+Mono:wght@100;300;500;700&display=swap'
            rel='stylesheet'
          />
        </Head>
        <body className='antialiased'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
