package com.dev.backend.service;

import java.util.regex.Pattern;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HtmlSanitizerService {

    private static final Pattern STYLE_PATTERN = Pattern.compile("^(max-width\\s*:\\s*100%.*|height\\s*:\\s*auto.*)$");
    private static final Pattern URL_PATTERN = Pattern.compile("^https?://.*|^mailto:.*");
    private static final Pattern TARGET_PATTERN = Pattern.compile("^_blank$");

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
                .onElements("img")
                .allowAttributes("alt", "title")
                .onElements("img")
                .allowAttributes("style")
                .matching(STYLE_PATTERN)
                .onElements("img")

                .allowElements("video")
                .allowStandardUrlProtocols()
                .allowAttributes("src")
                .onElements("video")
                .allowAttributes("controls", "preload")
                .onElements("video")
                .allowAttributes("style")
                .matching(STYLE_PATTERN)
                .onElements("video")

                .allowElements("a")
                .allowAttributes("href")
                .matching(URL_PATTERN)
                .onElements("a")
                .allowAttributes("target")
                .matching(TARGET_PATTERN)
                .onElements("a")

                .allowAttributes("class")
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