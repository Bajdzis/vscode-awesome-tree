import * as React from 'react';
import './Footer.css';

export const Footer: React.FC<{}> = () => {
    return <footer className="footer">
    If you like this extension, show it to your friends!
        <a href="https://github.com/Bajdzis/vscode-awesome-tree">Give a star on github</a>, 
        <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dbajdzis.awesome-tree&t=Awesome%20extension!">share on facebook</a> or
        <a href="https://twitter.com/share?url=https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dbajdzis.awesome-tree&text=Awesome%20extension!">share on twitter</a>
    </footer>;
};
