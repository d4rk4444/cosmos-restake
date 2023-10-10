import fs from "fs";
import consoleStamp from 'console-stamp';
import chalk, { ChalkInstance } from 'chalk';

export const parseFile = (file: any) => {
    const data = fs.readFileSync(file, "utf-8");
    const array = (data.replace(/[^a-zA-Z0-9\n ]/g,'')).split('\n');
    return array;
}

export const log = (type: string, message: string, color?: string) => {
    const output = fs.createWriteStream(`history.log`, { flags: 'a' });
    const logger = new console.Console(output);
    consoleStamp(console, { format: ':date(HH:MM:ss) :label' });
    consoleStamp(logger, { format: ':date(yyyy/mm/dd HH:MM:ss) :label', stdout: output });

    const coloredMessage = color ? chalk[color](message) : message;

    console[type](coloredMessage);
    logger[type](message);
};