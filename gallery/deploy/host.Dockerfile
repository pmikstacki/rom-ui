FROM scratch
COPY runtime/ /
COPY assets/ /gallery/assets/
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["/gallery/rom-ui-gallery-host", "/gallery/config/host.json"]
