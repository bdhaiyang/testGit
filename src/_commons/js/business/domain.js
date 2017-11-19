const domainReg = new RegExp("\.((test|sit)\.)?ffan\.com");

const commonReg = new RegExp('\\.((test|sit|uat)\\.)?(ffan\\.com)');

export function getDomainEnv (url = location.host, reg = commonReg) {
  const host = url || location.host
  const domainTestResult = host.match(reg)
  return domainTestResult ? (domainTestResult[2] ? domainTestResult[2] : 'pub') : 'sit'
}


export function getDomain(prefix, suffix) {
  const domainEnv = getDomainEnv();
  var env = (domainEnv == 'pub') ? '' : (domainEnv + '.');
  return `${prefix}${env || ''}${suffix}`;
}

function getEnv() {
  const host = location.host;

  if (host.match(new RegExp("^localhost:"))) {
    return "sit."
  }

  if (host.match(new RegExp("\^10\."))) {
    return "sit."
  }
  const domainTestResult  = host.match(domainReg);
  if (!domainTestResult) {
    return "sit."
  }
  return domainTestResult[1]
}

export const isDev = Boolean(getEnv());
