echo "Aggregating JavaScript files"
rm -f admin.js
for f in `cat admin.deps`; do cat $f >> admin.js; done;
rm -f index.js
for f in `cat index.deps`; do cat $f >> index.js; done;
rm -f local.js
for f in `cat local.deps`; do cat $f >> local.js; done;
rm -f user_stats.js
for f in `cat user_stats.deps`; do cat $f >> user_stats.js; done;
rm -f assignment.js
for f in `cat assignment.deps`; do cat $f >> assignment.js; done;
rm -f order.js
for f in `cat order.deps`; do cat $f >> order.js; done;
rm -f order_admin.js
for f in `cat order_admin.deps`; do cat $f >> order_admin.js; done;
rm -f invoice_print.js
for f in `cat invoice_print.deps`; do cat $f >> invoice_print.js; done;

#echo "RewriteEngine on" > .htaccess
#echo "RewriteCond %{HTTP:X-Forwarded-Proto} !https" >> .htaccess
#echo "RewriteRule .* https://%{HTTP_HOST}%{REQUEST_URI} [R,L]" >> .htaccess
