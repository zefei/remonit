Monitor = function(type, enabled) {
  var template
  if (type in Monitor.templates) {
    template = Monitor.templates[type]
  } else {
    template = Monitor.templates.empty
  }

  this.name = template.name
  this.frequency = template.frequency
  this.code = template.code
  this.location = '<local>'
  this.enabled = !!enabled
}

Monitor.templates = {
  empty: {
    description: 'Empty monitor',
    name: 'unnamed',
    frequency: 5,
    code:
    "// use $return(object) to update stats value\n" +
    "// use $exec(command, callback(err, stdout, stderr)) to use shell commands\n" +
    "// $exec runs remotely via SSH if monitor's location isn't local\n" +
    "// you can use 'require' just like in normal Node.js scripts\n"
  },

  datetime: {
    description: 'Date & time',
    name: 'datetime',
    frequency: 5,
    code:
    "// date time info from Date()\n" +
    "\n" +
    "var d = new Date()\n" +
    "var date = d.toDateString().split(' ')\n" +
    "var time = d.toTimeString().split(' ')[0].split(':')\n" +
    "\n" +
    "$return({\n" +
    "  day: date[0],\n" +
    "  month: date[1],\n" +
    "  date: date[2],\n" +
    "  year: date[3],\n" +
    "  hours: time[0],\n" +
    "  minutes: time[1],\n" +
    "  seconds: time[2]\n" +
    "})\n"
  },

  diskMac: {
    description: 'Disk usage',
    name: 'disk',
    frequency: 10,
    code:
    "// parse disk usage from `df`\n" +
    "\n" +
    "$exec('df -lg | tail -n +2', function(e, out) {\n" +
    "  var ret = []\n" +
    "  var disks = out.trim().split('\\n')\n" +
    "\n" +
    "  disks.forEach(function(disk) {\n" +
    "    if (!disk.match(/^\\/dev/)) return\n" +
    "\n" +
    "    var info = disk.split(/\\s+/)\n" +
    "    ret.push({\n" +
    "      dev: info[0],\n" +
    "      used: parseInt(info[4]),\n" +
    "      mount: info[8]\n" +
    "    })\n" +
    "  })\n" +
    "\n" +
    "  $return(ret)\n" +
    "})\n"
  },

  loadMac: {
    description: 'System load',
    name: 'load',
    frequency: 10,
    code:
    "// parse system load, cpu and memory utilization from `top`\n" +
    "\n" +
    "$exec('top -l 2 -n 0 | tail -n 12', function(e, out) {\n" +
    "  var load = out.match(/Load Avg:(.*)/i)[1].split(',')\n" +
    "  var cpu = out.match(/CPU usage:(.*)/i)[1].split(',')\n" +
    "  var mem = out.match(/PhysMem:(.*)/i)[1]\n" +
    "  var used = parseFloat(mem.match(/(\\d+)\\D* used/i)[1])\n" +
    "  var free = parseFloat(mem.match(/(\\d+)\\D* unused/i)[1])\n" +
    "  var total = used + free\n" +
    "\n" +
    "  $return({\n" +
    "    load: {\n" +
    "      _1m: load[0].trim(),\n" +
    "      _5m: load[1].trim(),\n" +
    "      _15m: load[2].trim()\n" +
    "    },\n" +
    "\n" +
    "    cpu: {\n" +
    "      user: parseFloat(cpu[0]).toFixed(2),\n" +
    "      sys: parseFloat(cpu[1]).toFixed(2),\n" +
    "      used: (parseFloat(cpu[0]) + parseFloat(cpu[1])).toFixed(2),\n" +
    "      idle: parseFloat(cpu[2]).toFixed(2)\n" +
    "    },\n" +
    "\n" +
    "    mem: {\n" +
    "      used: (used / total * 100).toFixed(2),\n" +
    "      free: (free / total * 100).toFixed(2)\n" +
    "    }\n" +
    "  })\n" +
    "})\n"
  },

  topCpuMac: {
    description: 'Processes by CPU',
    name: 'topCpu',
    frequency: 5,
    code:
    "// list processes by cpu time\n" +
    "\n" +
    "$exec('ps -Aro ucomm=Process,%cpu | head -n 21', function(e, out) {\n" +
    "  $return(out)\n" +
    "})\n"
  },

  topMemoryMac: {
    description: 'Processes by memory',
    name: 'topMemory',
    frequency: 10,
    code:
    "// list processes by memory\n" +
    "\n" +
    "$exec('ps -Amo ucomm=Process,%mem | head -n 21', function(e, out) {\n" +
    "  $return(out)\n" +
    "})\n"
  },

  logMac: {
    description: 'Log file watcher',
    name: 'logfile',
    frequency: 5,
    code:
    "// watch log file\n" +
    "\n" +
    "var filepath = '/var/log/system.log'\n" +
    "\n" +
    "$exec('tail -n 20 ' + filepath, function(e, out) {\n" +
    "  $return(out)\n" +
    "})\n"
  },

  diskLinux: {
    description: 'Disk usage',
    name: 'disk',
    frequency: 10,
    code:
    "// parse disk usage from `df`\n" +
    "\n" +
    "$exec('df -l | tail -n +2', function(e, out) {\n" +
    "  var ret = []\n" +
    "  var disks = out.trim().split('\\n')\n" +
    "\n" +
    "  disks.forEach(function(disk) {\n" +
    "    if (!disk.match(/^\\/dev/)) return\n" +
    "\n" +
    "    var info = disk.split(/\\s+/)\n" +
    "    ret.push({\n" +
    "      dev: info[0],\n" +
    "      used: parseInt(info[4]),\n" +
    "      mount: info[5]\n" +
    "    })\n" +
    "  })\n" +
    "\n" +
    "  $return(ret)\n" +
    "})\n"
  },

  loadLinux: {
    description: 'System load',
    name: 'load',
    frequency: 10,
    code:
    "// parse system load, cpu and memory utilization from `top`\n" +
    "\n" +
    "$exec('top -n 2 -b -p 0 | tail -n 9', function(e, out) {\n" +
    "  var load = out.match(/load average:(.*)/i)[1].split(',')\n" +
    "  var cpu = out.match(/\%Cpu\\(s\\):(.*)/i)[1].split(',')\n" +
    "  var mem = out.match(/KiB Mem:(.*)/i)[1].split(',')\n" +
    "  var used = parseFloat(mem[1])\n" +
    "  var free = parseFloat(mem[2])\n" +
    "  var total = parseFloat(mem[0])\n" +
    "\n" +
    "  $return({\n" +
    "    load: {\n" +
    "      _1m: load[0].trim(),\n" +
    "      _5m: load[1].trim(),\n" +
    "      _15m: load[2].trim()\n" +
    "    },\n" +
    "\n" +
    "    cpu: {\n" +
    "      user: parseFloat(cpu[0]).toFixed(2),\n" +
    "      sys: parseFloat(cpu[1]).toFixed(2),\n" +
    "      used: (parseFloat(cpu[0]) + parseFloat(cpu[1])).toFixed(2),\n" +
    "      idle: parseFloat(cpu[3]).toFixed(2)\n" +
    "    },\n" +
    "\n" +
    "    mem: {\n" +
    "      used: (used / total * 100).toFixed(2),\n" +
    "      free: (free / total * 100).toFixed(2)\n" +
    "    }\n" +
    "  })\n" +
    "})\n"
  },

  topCpuLinux: {
    description: 'Processes by CPU',
    name: 'topCpu',
    frequency: 5,
    code:
    "// list processes by cpu time\n" +
    "\n" +
    "$exec('ps -Ao ucomm=Process,%cpu --sort=-%cpu | head -n 21', function(e, out) {\n" +
    "  $return(out)\n" +
    "})\n"
  },

  topMemoryLinux: {
    description: 'Processes by memory',
    name: 'topMemory',
    frequency: 10,
    code:
    "// list processes by memory\n" +
    "\n" +
    "$exec('ps -Ao ucomm=Process,%mem --sort=-%mem | head -n 21', function(e, out) {\n" +
    "  $return(out)\n" +
    "})\n"
  },

  logLinux: {
    description: 'Log file watcher',
    name: 'logfile',
    frequency: 5,
    code:
    "// watch log file\n" +
    "\n" +
    "var filepath = '/var/log/syslog'\n" +
    "\n" +
    "$exec('tail -n 20 ' + filepath, function(e, out) {\n" +
    "  $return(out)\n" +
    "})\n"
  },

  diskWin: {
    description: 'Disk usage',
    name: 'disk',
    frequency: 10,
    code:
    "// parse disk usage from `wmic logicaldisk`\n" +
    "\n" +
    "$exec('wmic logicaldisk get Caption,FreeSpace,Size', function(e, out) {\n" +
    "  var ret = []\n" +
    "  var disks = out.trim().split('\\n')\n" +
    "\n" +
    "  disks.forEach(function(disk) {\n" +
    "    if (!disk.match(/\\d+/)) return\n" +
    "\n" +
    "    var info = disk.split(/\\s+/)\n" +
    "    var free = parseInt(info[1])\n" +
    "    var total = parseInt(info[2])\n" +
    "    var used = total - free\n" +
    "\n" +
    "    ret.push({\n" +
    "      dev: info[0][0],\n" +
    "      used: (used / total * 100).toFixed(2),\n" +
    "      mount: info[0][0]\n" +
    "    })\n" +
    "  })\n" +
    "\n" +
    "  $return(ret)\n" +
    "})\n"
  },

  loadWin: {
    description: 'System load',
    name: 'load',
    frequency: 10,
    code:
    "// parse cpu and memory utilization from `wmic cpu` and `wmic os`\n" +
    "\n" +
    "$exec('wmic cpu get LoadPercentage', function(e, outCpu) {\n" +
    "  $exec('wmic os get FreePhysicalMemory,TotalVisibleMemorySize', function(e, outMem) {\n" +
    "    var cpu = outCpu.match(/\\d+/)[0]\n" +
    "    var mem = outMem.match(/\\d+/g)\n" +
    "    var free = parseInt(mem[0])\n" +
    "    var total = parseInt(mem[1])\n" +
    "    var used = total - free\n" +
    "\n" +
    "    $return({\n" +
    "      load: {\n" +
    "        _1m: 'N/A',\n" +
    "        _5m: 'N/A',\n" +
    "        _15m: 'N/A'\n" +
    "      },\n" +
    "\n" +
    "      cpu: {\n" +
    "        user: 'N/A',\n" +
    "        sys: 'N/A',\n" +
    "        used: cpu,\n" +
    "        idle: 100 - parseInt(cpu)\n" +
    "      },\n" +
    "\n" +
    "      mem: {\n" +
    "        used: (used / total * 100).toFixed(2),\n" +
    "        free: (free / total * 100).toFixed(2)\n" +
    "      }\n" +
    "    })\n" +
    "  })\n" +
    "})\n"
  },

  topCpuWin: {
    description: 'Processes by CPU',
    name: 'topCpu',
    frequency: 0,
    code:
    "// Windows doesn't natively support this on command line\n" +
    "\n" +
    "$return('N/A')\n"
  },

  topMemoryWin: {
    description: 'Processes by memory',
    name: 'topMemory',
    frequency: 10,
    code:
    "// list processes by memory\n" +
    "\n" +
    "$exec('tasklist /nh | sort /r /+65', function(e, out) {\n" +
    "  var ret = 'Processes by memory used\\n'\n" +
    "\n" +
    "  out.trim().split('\\n').slice(0, 20).forEach(function(line) {\n" +
    "    ret += line.substring(0, 25) + line.substring(64)\n" +
    "  })\n" +
    "\n" +
    "  $return(ret)\n" +
    "})\n"
  },

  logWin: {
    description: 'Log file watcher',
    name: 'logfile',
    frequency: 0,
    code:
    "// Windows doesn't natively support this on command line\n" +
    "\n" +
    "$return('N/A')\n"
  }
}
