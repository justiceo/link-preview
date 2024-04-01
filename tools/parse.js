/* Straight-forward node.js arguments parser.
 * From https://github.com/eveningkid/args-parser/blob/master/parse.js
 */
export const parse = (argv) => {
  const ARGUMENT_SEPARATION_REGEX = /([^=\s]+)=?\s*(.*)/;

  // Removing node/bin and called script name
  argv = argv.slice(2);

  const parsedArgs = {};
  let argName, argValue;

  argv.forEach(function (arg) {
    // Separate argument for a key/value return
    arg = arg.match(ARGUMENT_SEPARATION_REGEX);
    arg.splice(0, 1);

    // Retrieve the argument name
    argName = arg[0];

    // Remove "--" or "-"
    if (argName.indexOf("-") === 0) {
      argName = argName.slice(argName.slice(0, 2).lastIndexOf("-") + 1);
    }

    // Parse argument value or set it to `true` if empty
    argValue =
      arg[1] !== ""
        ? parseFloat(arg[1]).toString() === arg[1]
          ? +arg[1]
          : arg[1]
        : true;

    parsedArgs[argName] = argValue;
  });

  return parsedArgs;
};
