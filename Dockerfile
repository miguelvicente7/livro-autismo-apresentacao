# Site estático mínimo (sem Nginx)
FROM busybox:1.37-uclibc

WORKDIR /www

COPY index.html styles.css script.js \
     checkout.html checkout.css checkout.js \
     ./

EXPOSE 4500

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4500/ > /dev/null || exit 1

CMD ["httpd", "-f", "-v", "-p", "4500", "-h", "/www"]
