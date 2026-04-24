const tags = Array.from(document.getElementsByTagName("*")).map(el => el.tagName);
console.log('from extension', tags);
