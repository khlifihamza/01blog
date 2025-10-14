package com.dev.backend.service;

import java.util.regex.Pattern;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HtmlSanitizerService {

    private final PolicyFactory policy;
    
    @Autowired
    public HtmlSanitizerService() {
        this.policy = new HtmlPolicyBuilder()
                .allowElements("p", "br", "div", "span")
                .allowElements("h1", "h2", "h3", "h4", "h5", "h6")
                .allowElements("strong", "b", "em", "i", "u")
                .allowElements("ul", "ol", "li")
                .allowElements("blockquote")

                .allowElements("img")
                .allowStandardUrlProtocols()
                .allowAttributes("src")
                .matching(Pattern.compile("^(https?://[^/]+/api/post/file/.*)$"))
                .onElements("img")
                .allowAttributes("alt", "title")
                .onElements("img")
                .allowAttributes("style")
                .matching(Pattern.compile("^(max-width\\s*:\\s*100%.*|height\\s*:\\s*auto.*)$"))
                .onElements("img")

                .allowElements("video")
                .allowStandardUrlProtocols()
                .allowAttributes("src")
                .matching(Pattern.compile("^(https?://[^/]+/api/post/file/.*)$"))
                .onElements("video")
                .allowAttributes("controls", "preload")
                .onElements("video")
                .allowAttributes("style")
                .matching(Pattern.compile("^(max-width\\s*:\\s*100%.*|height\\s*:\\s*auto.*)$"))
                .onElements("video")

                .allowElements("a")
                .allowAttributes("href")
                .matching(Pattern.compile("^https?://.*|^mailto:.*"))
                .onElements("a")
                .allowAttributes("target")
                .matching(Pattern.compile("^_blank$"))
                .onElements("a")

                .allowAttributes("class")
                .matching(Pattern.compile("^(media-element|delete-btn|mat-.*)$"))
                .globally()

                .allowAttributes("data-media-id")
                .matching(Pattern.compile("^[a-zA-Z0-9_-]+$"))
                .globally()

                .allowAttributes("contenteditable")
                .matching(Pattern.compile("^false$"))
                .globally()

                .allowElements("button")
                .allowAttributes("type", "aria-label", "mat-icon-button")
                .onElements("button")

                .allowElements("mat-icon")
                .allowTextIn("mat-icon")

                .toFactory();
    }

    public String sanitizeContent(String html) {
        if (html == null || html.trim().isEmpty()) {
            return "";
        }
        return policy.sanitize(html);
    }

    public String sanitizeTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            return "";
        }

        PolicyFactory titlePolicy = new HtmlPolicyBuilder().toFactory();
        return titlePolicy.sanitize(title);
    }
}